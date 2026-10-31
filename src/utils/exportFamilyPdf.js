import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getAllFamilies } from "../services/familyService";
import { getMembersByFamilyId } from "../services/memberService";
import { calculateAge } from "./calculateAge";
import { formatDate } from "./formatDate";

/**
 * Accurately detect whether a member is Female or Male.
 * Checks relationshipToHead, explicit gender, and name suffixes.
 */
export function isMemberFemale(member) {
  if (!member) return false;

  const rel = (member.relationshipToHead || "").toLowerCase();
  const femaleRelWords = [
    "પત્ની", "wife", "માતા", "mother", "પુત્રી", "daughter",
    "પૌત્રી", "દોહિત્રી", "granddaughter", "પુત્રવધૂ", "વધૂ", "daughter-in-law",
    "બહેન", "sister", "કાકી", "મામી", "માસી", "ફોઈ", "aunt",
    "ભાણી", "ભત્રીજી", "niece", "ગૃહિણી", "housewife", "સ્ત્રી", "female"
  ];

  // 1. If relationship clearly indicates female, return true
  if (femaleRelWords.some(w => rel.includes(w))) {
    return true;
  }

  // 2. Check explicit gender field if set
  const g = (member.gender || "").toLowerCase().trim();
  if (g === "female" || g === "f" || g.includes("સ્ત્રી") || g.includes("woman")) {
    return true;
  }

  // 3. Name check for common female suffixes (ben, ba, devi)
  const name = (member.fullName || "").toLowerCase();
  if (name.includes("ben") || name.includes("બેન") || name.includes(" ba") || name.includes(" બા") || name.includes("devi") || name.includes("દેવી")) {
    return true;
  }

  return false;
}

/**
 * HTML Escaping helper to prevent XSS / template injection in printable sheets.
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Clean file name for PDF download
 */
function sanitizeFileName(name) {
  if (!name) return "Family";
  return name.replace(/[^\w\s\u0A80-\u0AFF-]/gi, "").trim().replace(/\s+/g, "_");
}

/**
 * Helper to sort members with Head first.
 */
function prepareSortedMembers(family, rawMembers) {
  let sorted = [...(rawMembers || [])].sort((a, b) => {
    const isAHead = (a.relationshipToHead && a.relationshipToHead.includes("Self")) || a.id === family.headMemberId;
    const isBHead = (b.relationshipToHead && b.relationshipToHead.includes("Self")) || b.id === family.headMemberId;
    if (isAHead && !isBHead) return -1;
    if (!isAHead && isBHead) return 1;
    return 0;
  });

  if (sorted.length === 0 && family.headFullName) {
    sorted.push({
      fullName: family.headFullName,
      relationshipToHead: "મુખ્ય વડા (Self)",
      gender: "Male",
      dateOfBirth: family.dateOfBirth || "",
      education: family.education || "",
      occupation: family.occupation || "ખેતી (Farmer)",
      workplaceAddress: family.workplaceAddress || "",
      maternalVillage: family.maternalVillage || "",
      maternalSurname: family.maternalSurname || "",
      residentialAddress: family.residentialAddress || "",
      mobileNumber: family.mobileNumber || ""
    });
  }

  return sorted;
}

/**
 * Generate HTML string for a family record sheet.
 */
function buildFamilySheetHtml({
  family,
  sortedMembers,
  pageIndex = 1,
  totalPages = 1,
  overallStats = null,
  isMasterDirectory = false,
  todayStr
}) {
  const headMember = sortedMembers.find(
    m => (m.relationshipToHead && (m.relationshipToHead.includes("Self") || m.relationshipToHead.includes("વડા"))) || m.id === family.headMemberId
  ) || sortedMembers[0] || {};

  const headAddress = escapeHtml(headMember.residentialAddress || family.residentialAddress || "-");
  const headMobile = escapeHtml(headMember.mobileNumber || family.mobileNumber || "-");
  const headMosal = escapeHtml(headMember.maternalVillage || family.maternalVillage || "-");
  const headMosalSurname = escapeHtml(headMember.maternalSurname || family.maternalSurname || "");

  const totalMembers = sortedMembers.length;
  const femaleCount = sortedMembers.filter(m => isMemberFemale(m)).length;
  const maleCount = totalMembers - femaleCount;

  return `
    <div style="border: 2px solid #0f766e; border-radius: 8px; padding: 16px 20px; background: #ffffff;">
      ${overallStats ? `
        <!-- Master Directory Grand Summary Header (on Page 1) -->
        <div style="background: #042f2e; color: #ffffff; border-radius: 6px; padding: 10px 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px; color: #5eead4;">
              શ્રી સમસ્ત પરિવાર — સંપૂર્ણ ડિરેક્ટરી (Master Directory)
            </div>
            <div style="font-size: 11px; color: #ccfbf1; margin-top: 2px;">
              Admin Master Copy — સર્વ કુટુંબ અને સભ્યોની અધિકૃત માહિતી
            </div>
          </div>
          <div style="text-align: right; background: rgba(255,255,255,0.12); padding: 5px 12px; border-radius: 4px; font-size: 11px; border: 1px solid rgba(255,255,255,0.2);">
            <div><strong>કુલ કુટુંબ (Families):</strong> ${overallStats.totalFamilies}</div>
            <div style="color: #5eead4; font-weight: 700; margin-top: 2px;">
              કુલ સભ્યો: ${overallStats.totalMembers} (પુરુષ: ${overallStats.maleCount} | સ્ત્રી: ${overallStats.femaleCount})
            </div>
          </div>
        </div>
      ` : isMasterDirectory ? `
        <!-- Master Directory Top Strip for pages 2+ -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 6px; margin-bottom: 10px;">
          <div style="font-size: 15px; font-weight: 800; color: #0f766e;">
            શ્રી સમસ્ત પરિવાર — સંપૂર્ણ ડિરેક્ટરી
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #0f766e; background: #f0fdfa; border: 1px solid #ccfbf1; padding: 2px 8px; border-radius: 4px;">
            કુટુંબ ક્રમાંક: #${pageIndex} / ${totalPages}
          </div>
        </div>
      ` : `
        <!-- Single Family Title Header -->
        <div style="text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 12px;">
          <div style="font-size: 20px; font-weight: 800; color: #0f766e; letter-spacing: 0.5px; text-transform: uppercase;">
            શ્રી સમસ્ત પરિવાર — કુટુંબ વિગત પત્રક
          </div>
          <div style="font-size: 12px; color: #475569; margin-top: 2px; font-weight: 500;">
            Family Details & Members Directory
          </div>
        </div>
      `}

      <!-- Family Summary Top Box -->
      <div style="display: grid; grid-template-columns: 2fr 1.3fr 1.3fr; gap: 10px; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px;">
        <div>
          <span style="font-size: 10px; color: #0f766e; font-weight: 700; text-transform: uppercase;">
            ${isMasterDirectory ? `[કુટુંબ #${pageIndex}] ` : ""}કુટુંબના મુખ્ય વડા (Family Head):
          </span>
          <div style="font-size: 15px; font-weight: 800; color: #111827; margin-top: 1px;">
            ${escapeHtml(family.headFullName || "-")}
          </div>
        </div>

        <div>
          <span style="font-size: 10px; color: #0f766e; font-weight: 700; text-transform: uppercase;">મૂળ ગામ (Native Village):</span>
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 1px;">
            ${escapeHtml(family.originalVillage || "-")}
          </div>
        </div>

        <div>
          <span style="font-size: 10px; color: #0f766e; font-weight: 700; text-transform: uppercase;">માતાજીનું મઢ સ્થળ:</span>
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 1px;">
            ${escapeHtml(family.matajiMadhSthal || "-")}
          </div>
        </div>
      </div>

      <!-- Contact, Address and Mosal Row -->
      <div style="display: grid; grid-template-columns: 2.2fr 1.2fr 1.2fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 11px;">
        <div>
          <strong style="color: #475569;">હાલનું રહેઠાણ સરનામું:</strong> 
          <span style="color: #0f172a; font-weight: 600;">${headAddress}</span>
        </div>
        <div>
          <strong style="color: #475569;">સંપર્ક નંબર (Mobile):</strong> 
          <span style="color: #0f766e; font-weight: 700;">${headMobile}</span>
        </div>
        <div>
          <strong style="color: #475569;">વડાનું મોસાળ:</strong> 
          <span style="color: #0f172a; font-weight: 600;">${headMosal}${headMosalSurname ? ` (${headMosalSurname})` : ""}</span>
        </div>
      </div>

      <!-- Members Table (કોષ્ટક) Header -->
      <div style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: flex-end;">
        <span style="font-size: 13px; font-weight: 800; color: #0f766e;">
          કુટુંબના સભ્યોની સંપૂર્ણ યાદી (કોષ્ટક)
        </span>
        <span style="font-size: 11px; font-weight: 700; color: #334155;">
          કુલ સભ્યો: ${totalMembers} (પુરુષ: ${maleCount} | સ્ત્રી: ${femaleCount})
        </span>
      </div>

      <!-- Structured Table / કોષ્ટક -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #0f766e;">
        <thead>
          <tr style="background: #0f766e; color: #ffffff; text-align: left;">
            <th style="padding: 6px 4px; border: 1px solid #0d9488; text-align: center; width: 35px;">ક્રમ</th>
            <th style="padding: 6px 8px; border: 1px solid #0d9488; width: 170px;">સભ્યનું પૂરું નામ</th>
            <th style="padding: 6px 8px; border: 1px solid #0d9488; width: 110px;">સંબંધ (Relation)</th>
            <th style="padding: 6px 6px; border: 1px solid #0d9488; text-align: center; width: 55px;">જાતિ</th>
            <th style="padding: 6px 6px; border: 1px solid #0d9488; text-align: center; width: 95px;">જન્મ તારીખ / ઉંમર</th>
            <th style="padding: 6px 8px; border: 1px solid #0d9488; width: 95px;">અભ્યાસ</th>
            <th style="padding: 6px 8px; border: 1px solid #0d9488; width: 110px;">વ્યવસાય (કામ)</th>
            <th style="padding: 6px 8px; border: 1px solid #0d9488; width: 150px;">દુકાન / ઓફિસ સરનામું</th>
            <th style="padding: 6px 8px; border: 1px solid #0d9488; width: 90px;">મોસાળ</th>
          </tr>
        </thead>
        <tbody>
          ${sortedMembers.map((m, idx) => {
            const age = calculateAge(m.dateOfBirth);
            const formattedDob = formatDate(m.dateOfBirth);
            const isHead = (m.relationshipToHead && (m.relationshipToHead.includes("Self") || m.relationshipToHead.includes("વડા"))) || m.id === family.headMemberId || idx === 0;
            const rowBg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
            
            const isFemale = isMemberFemale(m);
            const genderGuj = isFemale ? "સ્ત્રી" : "પુરુષ";
            const relDisplay = isHead ? "મુખ્ય વડા (Self)" : (m.relationshipToHead || "-");

            return `
              <tr style="background: ${rowBg}; border-bottom: 1px solid #cbd5e1;">
                <td style="padding: 5px 4px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #475569;">
                  ${idx + 1}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: ${isHead ? '800' : '600'}; color: #0f172a;">
                  ${escapeHtml(m.fullName || "-")}
                  ${isHead ? '<span style="font-size: 9px; margin-left: 4px; background: #ccfbf1; color: #0f766e; padding: 1px 4px; border-radius: 3px; font-weight: 700;">વડા</span>' : ''}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #334155; font-weight: 500;">
                  ${escapeHtml(relDisplay)}
                </td>
                <td style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; color: ${isFemale ? '#b91c1c' : '#0369a1'}; font-weight: 600;">
                  ${genderGuj}
                </td>
                <td style="padding: 5px 6px; border: 1px solid #cbd5e1; text-align: center; color: #334155;">
                  ${formattedDob ? `<div>${escapeHtml(formattedDob)}</div>` : ""}
                  ${age !== null ? `<strong style="color: #0f766e; font-size: 10px;">(${age} વર્ષ)</strong>` : (!formattedDob ? "-" : "")}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #334155;">
                  ${escapeHtml(m.education || "-")}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #1e293b; font-weight: 600;">
                  ${escapeHtml(m.occupation || "-")}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #475569; font-size: 10px;">
                  ${escapeHtml(m.workplaceAddress || "-")}
                </td>
                <td style="padding: 5px 8px; border: 1px solid #cbd5e1; color: #334155;">
                  ${escapeHtml(m.maternalVillage || "-")}
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <!-- Document Footer -->
      <div style="margin-top: 12px; padding-top: 6px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
        <div>
          પ્રિન્ટ તારીખ: <strong>${todayStr}</strong>
        </div>
        <div style="font-weight: 700; color: #0f766e;">
          ${isMasterDirectory ? "શ્રી સમસ્ત પરિવાર ડિરેક્ટરી — અધિકૃત એડમિન માસ્ટર કોપી" : "શ્રી સમસ્ત પરિવાર ડિરેક્ટરી — અધિકૃત કુટુંબ વિગત પત્રક"}
        </div>
        <div>
          પાના નં. <strong>${pageIndex}</strong> of <strong>${totalPages}</strong>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render HTML content into high-resolution canvas completely offscreen.
 */
async function renderHtmlToCanvas(htmlContent) {
  const wrapper = document.createElement("div");
  wrapper.className = "pdf-headless-offscreen-wrapper";
  wrapper.style.position = "fixed";
  wrapper.style.left = "-15000px";
  wrapper.style.top = "0";
  wrapper.style.width = "1080px";
  wrapper.style.zIndex = "-999999";
  wrapper.style.background = "#ffffff";
  wrapper.style.pointerEvents = "none";
  wrapper.style.overflow = "hidden";

  const container = document.createElement("div");
  container.className = "family-pdf-render-root";
  container.style.width = "1080px";
  container.style.background = "#ffffff";
  container.style.color = "#0f172a";
  container.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Gujarati Sangam MN', 'Shruti', 'Nirmala UI', sans-serif";
  container.style.padding = "16px 20px";
  container.style.boxSizing = "border-box";
  container.innerHTML = htmlContent;

  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  try {
    await new Promise(resolve => setTimeout(resolve, 80));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 1080,
      onclone: (clonedDoc) => {
        const root = clonedDoc.querySelector(".family-pdf-render-root");
        if (root && root.parentElement) {
          root.parentElement.style.position = "absolute";
          root.parentElement.style.left = "0";
          root.parentElement.style.top = "0";
        }
      }
    });

    return canvas;
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
}

/**
 * Generate and download a single family's PDF sheet.
 */
export async function downloadFamilyPdf(family, membersList = null) {
  if (!family) {
    throw new Error("Family data is required to generate PDF.");
  }

  const familyId = family.id || family.familyId;
  let members = membersList;

  if (!members || !Array.isArray(members) || members.length === 0) {
    if (familyId) {
      try {
        members = await getMembersByFamilyId(familyId);
      } catch (e) {
        console.warn("Could not fetch members by familyId:", e);
        members = [];
      }
    } else {
      members = [];
    }
  }

  const sortedMembers = prepareSortedMembers(family, members);
  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const html = buildFamilySheetHtml({
    family,
    sortedMembers,
    pageIndex: 1,
    totalPages: 1,
    todayStr
  });

  try {
    const canvas = await renderHtmlToCanvas(html);
    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = 297;
    const pdfHeight = 210;
    const margin = 8;
    const printWidth = pdfWidth - (margin * 2);
    const printHeight = (canvas.height * printWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", margin, margin, printWidth, Math.min(printHeight, pdfHeight - (margin * 2)));

    const filename = `${sanitizeFileName(family.headFullName)}_Kutumb_Details.pdf`;
    pdf.save(filename);
    return true;
  } catch (err) {
    console.error("Direct PDF generation error:", err);
    openPrintFallback(html, family);
    return false;
  }
}

/**
 * ADMIN ONLY: Export all families and all member records into a single master PDF document.
 * @param {Array} [familiesList] - Optional list of families. If not passed, fetched dynamically.
 * @param {Function} [onProgress] - Callback function for progress updates: ({ current, total, status })
 */
export async function downloadAllFamiliesMasterPdf(familiesList = null, onProgress = null) {
  let families = familiesList;
  if (!families || families.length === 0) {
    if (onProgress) onProgress({ current: 0, total: 0, status: "Loading all families from database..." });
    families = await getAllFamilies();
  }

  if (!families || families.length === 0) {
    alert("No family records found to export.");
    return false;
  }

  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  if (onProgress) onProgress({ current: 0, total: families.length, status: "Preparing family records..." });

  // 1. Gather all family data and members
  const allFamiliesData = [];
  let grandTotalMembers = 0;
  let grandMaleCount = 0;
  let grandFemaleCount = 0;

  for (let i = 0; i < families.length; i++) {
    const fam = families[i];
    const famId = fam.id || fam.familyId;
    let mems = [];
    try {
      mems = await getMembersByFamilyId(famId);
    } catch (e) {
      mems = [];
    }

    const sorted = prepareSortedMembers(fam, mems);
    for (const m of sorted) {
      grandTotalMembers++;
      if (isMemberFemale(m)) {
        grandFemaleCount++;
      } else {
        grandMaleCount++;
      }
    }

    allFamiliesData.push({
      family: fam,
      sortedMembers: sorted
    });
  }

  const overallStats = {
    totalFamilies: allFamiliesData.length,
    totalMembers: grandTotalMembers,
    maleCount: grandMaleCount,
    femaleCount: grandFemaleCount
  };

  // 2. Initialize Landscape A4 PDF
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  const pdfWidth = 297;
  const pdfHeight = 210;
  const margin = 8;
  const printWidth = pdfWidth - (margin * 2);

  // 3. Render each family onto its own page in the master PDF
  for (let i = 0; i < allFamiliesData.length; i++) {
    const { family, sortedMembers } = allFamiliesData[i];
    const pageNum = i + 1;

    if (onProgress) {
      onProgress({
        current: pageNum,
        total: allFamiliesData.length,
        status: `Exporting page ${pageNum} of ${allFamiliesData.length}: ${family.headFullName}...`
      });
    }

    if (i > 0) {
      pdf.addPage("a4", "landscape");
    }

    const html = buildFamilySheetHtml({
      family,
      sortedMembers,
      pageIndex: pageNum,
      totalPages: allFamiliesData.length,
      overallStats: i === 0 ? overallStats : null, // Grand summary banner on Page 1
      isMasterDirectory: true,
      todayStr
    });

    const canvas = await renderHtmlToCanvas(html);
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const printHeight = (canvas.height * printWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", margin, margin, printWidth, Math.min(printHeight, pdfHeight - (margin * 2)));
  }

  if (onProgress) {
    onProgress({
      current: allFamiliesData.length,
      total: allFamiliesData.length,
      status: "Finalizing Master PDF file..."
    });
  }

  const dateSlug = new Date().toISOString().slice(0, 10);
  const filename = `Samast_Parivar_Sampurna_Master_Directory_${dateSlug}.pdf`;
  pdf.save(filename);

  if (onProgress) {
    onProgress({
      current: allFamiliesData.length,
      total: allFamiliesData.length,
      status: "Download Complete!"
    });
  }

  return true;
}

/**
 * Fallback in case browser sandbox or security prevents canvas export
 */
function openPrintFallback(htmlContent, family) {
  const printWindow = window.open("", "_blank", "width=1000,height=750");
  if (!printWindow) {
    alert("Please allow popups to print/download the PDF.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${family?.headFullName || "Directory"} - Kutumb Details</title>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          body { font-family: system-ui, sans-serif; margin: 0; padding: 12px; }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
