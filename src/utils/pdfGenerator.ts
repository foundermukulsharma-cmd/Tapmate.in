import { jsPDF } from 'jspdf';
import { OrderRecord } from '../types';

/**
 * Generates an executive, professional PDF Dossier for any customer order.
 * Includes photo, card specifications, contact info, and payment records.
 */
export async function generateOrderPDF(order: OrderRecord): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 16;

  // Header Bar (Dark Slate)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TapMate.in', margin + 6, y + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('SMART NFC DIGITAL BUSINESS CARDS • CUSTOMER DOSSIER', margin + 6, y + 16);

  // Order ID Badge on Top Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(order.orderId, pageWidth - margin - 6, y + 9, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${order.date} ${order.time || ''}`, pageWidth - margin - 6, y + 16, { align: 'right' });

  y += 28;

  // Status Ribbons Bar
  const isPaid = order.paymentStatus === 'PAID';
  doc.setFillColor(isPaid ? 240 : 254, isPaid ? 253 : 243, isPaid ? 244 : 199);
  doc.setDrawColor(isPaid ? 34 : 245, isPaid ? 197 : 158, isPaid ? 94 : 11);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(isPaid ? 22 : 180, isPaid ? 101 : 83, isPaid ? 52 : 9);
  doc.text(`PAYMENT STATUS: ${order.paymentStatus}`, margin + 6, y + 6.5);

  doc.setTextColor(51, 65, 85);
  doc.text(`ORDER STATUS: ${order.orderStatus.toUpperCase()}`, pageWidth - margin - 6, y + 6.5, { align: 'right' });

  y += 16;

  // Customer Information Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Customer & Profile Information', margin, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Profile Photo (Embedded if available)
  let photoIncluded = false;
  const photoSize = 26;
  if (order.customer.profilePhotoUrl && order.customer.profilePhotoUrl.startsWith('data:image')) {
    try {
      doc.addImage(order.customer.profilePhotoUrl, 'JPEG', margin, y, photoSize, photoSize);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, photoSize, photoSize, 'S');
      photoIncluded = true;
    } catch {
      photoIncluded = false;
    }
  }

  const detailsX = photoIncluded ? margin + photoSize + 6 : margin;
  const detailsWidth = pageWidth - margin - detailsX;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(order.customer.fullName, detailsX, y + 4);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(14, 116, 144); // cyan-700
  doc.text(order.customer.profession, detailsX, y + 9);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${order.customer.email}`, detailsX, y + 14);
  doc.text(
    `Mobile 1: ${order.customer.mobile1} ${order.customer.mobile2 ? ` | Mobile 2: ${order.customer.mobile2}` : ''}`,
    detailsX,
    y + 19
  );

  y += photoIncluded ? photoSize + 4 : 24;

  // Bio / Description
  if (order.customer.professionDescription) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PROFESSION / BIO DESCRIPTION:', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const splitBio = doc.splitTextToSize(order.customer.professionDescription, pageWidth - margin * 2);
    doc.text(splitBio, margin, y);
    y += splitBio.length * 4 + 4;
  }

  // Social Links List
  const socials = order.customer.socialLinks || {};
  const socialEntries = Object.entries(socials).filter(([_, val]) => !!val);
  if (socialEntries.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CONNECTED SOCIAL & WEB PROFILES:', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    const socialText = socialEntries.map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('   •   ');
    const splitSocials = doc.splitTextToSize(socialText, pageWidth - margin * 2);
    doc.text(splitSocials, margin, y);
    y += splitSocials.length * 4 + 6;
  } else {
    y += 2;
  }

  // Section 2: Physical NFC Card Production Specifications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Physical NFC Cards Customization & Production', margin, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Card 1 Box
  const cardBoxWidth = order.card2 ? (pageWidth - margin * 2 - 6) / 2 : pageWidth - margin * 2;
  const cardBoxHeight = 36;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, cardBoxWidth, cardBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('CARD 1 (PRIMARY NFC CARD)', margin + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Material: ${order.card1.material}`, margin + 4, y + 12);
  doc.text(`Color / Finish: ${order.card1.color}`, margin + 4, y + 17);
  doc.text(`Printed / Laser Name: ${order.card1.printedName}`, margin + 4, y + 22);
  if (order.card1.logoNotes) {
    doc.text(`Branding Notes: ${order.card1.logoNotes}`, margin + 4, y + 27);
  }
  doc.text(`NFC Microchip: High-Speed NTAG216 (Contactless)`, margin + 4, y + 32);

  // Card 2 Box if present
  if (order.card2) {
    const card2X = margin + cardBoxWidth + 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(card2X, y, cardBoxWidth, cardBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('CARD 2 (OPTIONAL BACKUP)', card2X + 4, y + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Material: ${order.card2.material}`, card2X + 4, y + 12);
    doc.text(`Color / Finish: ${order.card2.color}`, card2X + 4, y + 17);
    doc.text(`Printed / Laser Name: ${order.card2.printedName}`, card2X + 4, y + 22);
    if (order.card2.logoNotes) {
      doc.text(`Branding Notes: ${order.card2.logoNotes}`, card2X + 4, y + 27);
    }
    doc.text(`NFC Microchip: High-Speed NTAG216 (Contactless)`, card2X + 4, y + 32);
  }

  y += cardBoxHeight + 8;

  // Section 3: Subscription & Financial Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Plan & Billing Summary', margin, y);
  y += 4;

  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Bill Table
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('DESCRIPTION', margin + 4, y + 4.5);
  doc.text('AMOUNT', pageWidth - margin - 4, y + 4.5, { align: 'right' });
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  doc.text(`${order.plan} Membership Subscription (${order.durationMonths} Months)`, margin + 4, y);
  doc.text(`INR ${order.planTotal}`, pageWidth - margin - 4, y, { align: 'right' });
  y += 5;

  if (order.discount > 0) {
    doc.setTextColor(16, 185, 129);
    doc.text(`Duration Savings Discount`, margin + 4, y);
    doc.text(`- INR ${order.discount}`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5;
  }

  doc.setTextColor(30, 41, 59);
  doc.text(`Physical NFC Card Production (${order.numberOfCards} Card${order.numberOfCards > 1 ? 's' : ''})`, margin + 4, y);
  doc.text(`INR ${order.cardCharges}`, pageWidth - margin - 4, y, { align: 'right' });
  y += 5;

  if (order.couponCode && order.couponDiscount) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Coupon Discount (${order.couponCode} - Gold Membership Free)`, margin + 4, y);
    doc.text(`- INR ${order.couponDiscount}`, pageWidth - margin - 4, y, { align: 'right' });
    y += 5;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Final Total Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL AMOUNT PAID', margin + 4, y);
  doc.text(`INR ${order.finalAmount}`, pageWidth - margin - 4, y, { align: 'right' });
  y += 9;

  // Payment Verification Reference Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Payment Gateway ID: ${order.paymentId || 'N/A'}`, margin + 4, y + 5);
  doc.text(`Bank Reference / UTR Number: ${order.transactionId || 'N/A'}`, margin + 4, y + 10);
  doc.text(`Official UPI VPA: mukul620352.rzp@rxairtel (Tapmate.in)`, pageWidth - margin - 4, y + 5, {
    align: 'right',
  });
  doc.text(`Google Sheet Synced: ${order.syncedToGoogleSheet ? 'YES (Automatic)' : 'Pending'}`, pageWidth - margin - 4, y + 10, {
    align: 'right',
  });

  y += 24;

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This document is an electronically generated production record of TapMate.in. All customer information is securely stored.',
    margin,
    y
  );

  // Save the PDF
  const cleanName = order.customer.fullName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`TapMate_${order.orderId}_${cleanName}.pdf`);
}
