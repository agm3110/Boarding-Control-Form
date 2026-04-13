'use strict';

require('dotenv').config();

const express  = require('express');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname)));

// ─── EMAIL CONFIGURATION ─────────────────────────────────────────────────────
// For Gmail: enable 2-Factor Authentication, then create an App Password at
// https://myaccount.google.com/apppasswords  (choose "Mail" + your device)
const EMAIL_CONFIG = {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromName: process.env.SMTP_FROM_NAME || 'Norwegian BCF',
    allowSelfSigned: process.env.SMTP_ALLOW_SELF_SIGNED === 'true'
};
// ─────────────────────────────────────────────────────────────────────────────

// ── HTML email body ──────────────────────────────────────────────────────────
function buildHtmlBody(formData) {
    const td = (label, value) => `
        <tr>
          <td style="color:#6c757d;font-size:13px;padding:5px 16px 5px 0;vertical-align:top;white-space:nowrap">${label}</td>
          <td style="font-size:13px;font-weight:600;padding:5px 0;color:#111">${value !== undefined && value !== null && value !== '' ? value : 'TL'}</td>
        </tr>`;

    const section = (title) => `
        <tr>
          <td colspan="2" style="padding-top:20px;padding-bottom:6px">
            <span style="background:#00205B;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:3px;text-transform:uppercase;letter-spacing:.6px">${title}</span>
          </td>
        </tr>`;

    const agents = formData.agents && formData.agents.length
        ? formData.agents.map((a, i) => td(`Agent ${i + 1}`, `${a.name} — Arrived: ${a.arrivedTime || 'TL'}`)).join('')
        : td('', 'No agents added.');

    const services = formData.specialServices.hasServices && Object.keys(formData.specialServices.services).length
        ? Object.entries(formData.specialServices.services).map(([code, d]) => {
            const seats = d.seats && d.seats.length ? d.seats.join(', ') : 'None';
            return td(code, `Count: ${d.count} | Seats: ${seats}`);
          }).join('')
        : td('', 'No special services.');

    const buses = formData.busGate.hasBusGate && formData.busGate.buses.length
        ? formData.busGate.buses.map(b =>
            td(b.busNumber, `Arrived: ${b.arrivedTime || 'TL'} | Departed: ${b.departedTime || 'TL'}`)).join('')
        : td('', 'No bus gate entries.');

    const delays = formData.delayCodes.hasDelayCodes && formData.delayCodes.codes.length
        ? formData.delayCodes.codes.map(c =>
            td(c.code, `${c.description} — ${c.minutes} min`)).join('')
        : td('', 'No delay codes.');

    const crewChange = formData.flightCrewChange && formData.flightCrewChange.hasCrewChange
        ? td('Crew Arrived at the Gate', formData.flightCrewChange.crewArrivedTime || 'TL')
        : td('', 'No crew change.');

    const comments = formData.comments.hasComments && formData.comments.text
        ? `<tr><td colspan="2" style="font-size:13px;padding:5px 0;white-space:pre-wrap;color:#111">${formData.comments.text}</td></tr>`
        : td('', 'No comments.');

    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:24px 8px">
<table width="620" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <!-- Header -->
  <tr><td style="background:#00205B;padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700">Norwegian Air</p>
          <p style="margin:4px 0 0;color:#90a4c8;font-size:12px">Digital Boarding Control Form</p>
        </td>
        <td align="right">
          <p style="margin:0;color:#fff;font-size:26px;font-weight:800">${formData.flightInfo.flightNumber || ''}</p>
          <p style="margin:4px 0 0;color:#90a4c8;font-size:12px">${formData.flightInfo.date || ''}</p>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="background:#D81939;height:5px;padding:0"></td></tr>

  <!-- Body -->
  <tr><td style="padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${section('Flight Information')}
      ${td('Flight Number', formData.flightInfo.flightNumber)}
      ${td('Destination', formData.flightInfo.destination)}
      ${td('Gate', formData.flightInfo.gate)}
      ${td('Date', formData.flightInfo.date)}

      ${section('Scheduled / Actual Times')}
      ${td('STA', formData.scheduledActualTimes.sta)}
      ${td('STD', formData.scheduledActualTimes.std)}
      ${td('ATA', formData.scheduledActualTimes.ata)}
      ${td('ATD', formData.scheduledActualTimes.atd)}

      ${section('Agents')}
      ${agents}

      ${section('Times')}
      ${td('Boarding Start', formData.times.boardingStart)}
      ${td('Boarding Close', formData.times.boardingClose)}
      ${td('Gate Open', formData.times.gateOpen)}
      ${td('Gate Close', formData.times.gateClose)}
      ${td('Last Call', formData.times.lastCall)}
      ${td('Doors Closed', formData.times.doorsClosed)}

      ${section('Bags')}
      ${td('Total Bags', formData.bagsData.totalBags)}
      ${td('Offload Bags Request', formData.bagsData.offloadBagsRequest)}
      ${td('Gate Bags Charged', formData.bagsData.gateBagsCharged)}
      ${td('Total Charged Amount (DKK)', formData.bagsData.totalChargedAmount)}
      ${td('Gate Bags Tagged', formData.bagsData.gateBagsTagged)}

      ${section('Pax (Passengers)')}
      ${td('Pax Accepted', `${formData.passengerData.paxAcceptedAdult} adults + ${formData.passengerData.paxAcceptedInfant} infants`)}
      ${td('Pax Boarded', `${formData.passengerData.paxBoardedAdult} adults + ${formData.passengerData.paxBoardedInfant} infants`)}
      ${td('Pax Offloaded', formData.passengerData.paxOffloaded)}
      ${td('No Show', formData.passengerData.noShow)}

      ${section('Special Services')}
      ${services}

      ${section('Bus Gate')}
      ${buses}

    ${section('Flight Crew Change')}
    ${crewChange}

      ${section('Delay Codes')}
      ${delays}

      ${section('Comments / Special Events')}
      ${comments}
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8f9fa;border-top:1px solid #dee2e6;padding:14px 32px;text-align:center;color:#6c757d;font-size:11px">
    Norwegian Air Boarding Control Form — Digital Version
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

// ── PDF generation ───────────────────────────────────────────────────────────
function generatePdf(formData) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const RED       = '#D81939';
        const DARK_BLUE = '#00205B';
        const TEXT      = '#222222';
        const MUTED     = '#6c757d';
        const L = 40;
        const R = doc.page.width - 40;
        const W = R - L;

        let y = 0;
        const val = (v) => (v !== undefined && v !== null && v !== '' ? String(v) : 'TL');

        // ── Header band ────────────────────────────────────────────────
        doc.rect(0, 0, doc.page.width, 64).fill(DARK_BLUE);
        doc.rect(0, 64, doc.page.width, 5).fill(RED);

        doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
           .text('Norwegian Air', L, 14, { lineBreak: false });
        doc.fillColor('white').fontSize(9).font('Helvetica')
           .text('Digital Boarding Control Form', L, 38, { lineBreak: false });

        const flightNo = formData.flightInfo.flightNumber || '';
        doc.fillColor('white').fontSize(24).font('Helvetica-Bold')
           .text(flightNo, L, 8, { width: W, align: 'right', lineBreak: false });
        doc.fillColor('#90a4c8').fontSize(9).font('Helvetica')
           .text(formData.flightInfo.date || '', L, 38, { width: W, align: 'right', lineBreak: false });

        doc.fillColor(MUTED).fontSize(7.5).font('Helvetica')
           .text(`Generated: ${new Date().toLocaleString()}`, L, 56, { width: W, align: 'right', lineBreak: false });

        y = 84;

        // ── Helpers ────────────────────────────────────────────────────
        function checkPage() {
            if (y > doc.page.height - 60) {
                doc.addPage();
                y = 40;
            }
        }

        function section(title) {
            checkPage();
            y += 6;
            doc.rect(L, y, W, 17).fill(DARK_BLUE);
            doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
               .text(title.toUpperCase(), L + 6, y + 5, { width: W - 12, lineBreak: false });
            y += 22;
        }

        function row(label, value) {
            checkPage();
            doc.fillColor(MUTED).fontSize(9).font('Helvetica')
               .text(label, L + 2, y, { width: 158, lineBreak: false });
            doc.fillColor(TEXT).fontSize(9).font('Helvetica-Bold')
               .text(val(value), L + 164, y, { width: W - 164, lineBreak: false });
            y += 16;
        }

        function row2(pairs) {
            checkPage();
            const colW = W / pairs.length;
            pairs.forEach(([label, value], i) => {
                const x = L + i * colW;
                doc.fillColor(MUTED).fontSize(8).font('Helvetica')
                   .text(label, x + 2, y, { width: colW - 8, lineBreak: false });
                doc.fillColor(TEXT).fontSize(9).font('Helvetica-Bold')
                   .text(val(value), x + 2, y + 12, { width: colW - 8, lineBreak: false });
            });
            y += 30;
        }

        // ── Flight Information ─────────────────────────────────────────
        section('Flight Information');
        row2([
            ['Flight Number', formData.flightInfo.flightNumber],
            ['Destination',   formData.flightInfo.destination],
            ['Gate',          formData.flightInfo.gate],
            ['Date',          formData.flightInfo.date]
        ]);

        // ── Scheduled / Actual Times ───────────────────────────────────
        section('Scheduled / Actual Times');
        row2([
            ['STA', formData.scheduledActualTimes.sta],
            ['STD', formData.scheduledActualTimes.std],
            ['ATA', formData.scheduledActualTimes.ata],
            ['ATD', formData.scheduledActualTimes.atd]
        ]);

        // ── Agents ────────────────────────────────────────────────────
        section('Agents');
        if (!formData.agents || formData.agents.length === 0) {
            row('', 'No agents added.');
        } else {
            formData.agents.forEach((a, i) => {
                row(`Agent ${i + 1}`, `${a.name}   —   Arrived: ${a.arrivedTime || 'TL'}`);
            });
        }

        // ── Times ─────────────────────────────────────────────────────
        section('Times');
        row2([['Boarding Start', formData.times.boardingStart], ['Boarding Close', formData.times.boardingClose]]);
        row2([['Gate Open',      formData.times.gateOpen],      ['Gate Close',     formData.times.gateClose]]);
        row2([['Last Call',      formData.times.lastCall],      ['Doors Closed',   formData.times.doorsClosed]]);

        // ── Bags ──────────────────────────────────────────────────────
        section('Bags');
        row2([['Total Bags', formData.bagsData.totalBags], ['Offload Bags Request', formData.bagsData.offloadBagsRequest]]);
        row2([
            ['Gate Bags Charged',    formData.bagsData.gateBagsCharged],
            ['Total Charged (DKK)', formData.bagsData.totalChargedAmount],
            ['Gate Bags Tagged',    formData.bagsData.gateBagsTagged]
        ]);

        // ── Pax ───────────────────────────────────────────────────────
        section('Pax (Passengers)');
        row2([
            ['Pax Accepted', `${formData.passengerData.paxAcceptedAdult} adults + ${formData.passengerData.paxAcceptedInfant} infants`],
            ['Pax Boarded',  `${formData.passengerData.paxBoardedAdult} adults + ${formData.passengerData.paxBoardedInfant} infants`]
        ]);
        row2([['Pax Offloaded', formData.passengerData.paxOffloaded], ['No Show', formData.passengerData.noShow]]);

        // ── Special Services ──────────────────────────────────────────
        section('Special Services');
        if (!formData.specialServices.hasServices || !Object.keys(formData.specialServices.services).length) {
            row('', 'No special services.');
        } else {
            Object.entries(formData.specialServices.services).forEach(([code, d]) => {
                const seats = d.seats && d.seats.length ? d.seats.join(', ') : 'None';
                row(code, `Count: ${d.count}   |   Seats: ${seats}`);
            });
        }

        // ── Bus Gate ──────────────────────────────────────────────────
        section('Bus Gate');
        if (!formData.busGate.hasBusGate || !formData.busGate.buses.length) {
            row('', 'No bus gate entries.');
        } else {
            formData.busGate.buses.forEach(b => {
                row(b.busNumber, `Arrived: ${b.arrivedTime || 'TL'}   |   Departed: ${b.departedTime || 'TL'}`);
            });
        }

        // ── Flight Crew Change ──────────────────────────────────────
        section('Flight Crew Change');
        if (!formData.flightCrewChange || !formData.flightCrewChange.hasCrewChange) {
            row('', 'No crew change.');
        } else {
            row('Crew Arrived at the Gate', formData.flightCrewChange.crewArrivedTime || 'TL');
        }

        // ── Delay Codes ───────────────────────────────────────────────
        section('Delay Codes');
        if (!formData.delayCodes.hasDelayCodes || !formData.delayCodes.codes.length) {
            row('', 'No delay codes.');
        } else {
            formData.delayCodes.codes.forEach(item => {
                row(item.code, `${item.description}   (${item.minutes} min)`);
            });
        }

        // ── Comments ──────────────────────────────────────────────────
        section('Comments / Special Events');
        if (!formData.comments.hasComments || !formData.comments.text) {
            row('', 'No comments.');
        } else {
            checkPage();
            doc.fillColor(TEXT).fontSize(9).font('Helvetica')
               .text(formData.comments.text, L + 2, y, { width: W - 4 });
            y += doc.heightOfString(formData.comments.text, { width: W - 4 }) + 8;
        }

        // ── Page footer ───────────────────────────────────────────────
        const pages = doc.bufferedPageRange();
        for (let i = pages.start; i < pages.start + pages.count; i++) {
            doc.switchToPage(i);
            doc.fillColor(MUTED).fontSize(8).font('Helvetica')
               .text('Norwegian Air Boarding Control Form — Digital Version',
                     L, doc.page.height - 28, { width: W, align: 'center', lineBreak: false });
        }

        doc.end();
    });
}

// ── API route ────────────────────────────────────────────────────────────────
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body;

        if (!formData || !formData.flightInfo) {
            return res.status(400).json({ success: false, message: 'Invalid form data.' });
        }

        const recipientEmail = (formData.delivery && formData.delivery.recipientEmail) || '';
        if (!recipientEmail) {
            return res.status(400).json({ success: false, message: 'Recipient email is required.' });
        }

        // Validate email config
        if (!EMAIL_CONFIG.user || !EMAIL_CONFIG.pass) {
            return res.status(500).json({
                success: false,
                message: 'Email not configured. Set SMTP_USER and SMTP_PASS before starting the server, or update server.js.'
            });
        }

        // Generate PDF
        const pdfBuffer = await generatePdf(formData);

        const flight = (formData.flightInfo.flightNumber || 'flight').replace(/[^a-zA-Z0-9-]/g, '');
        const date   = formData.flightInfo.date || new Date().toISOString().split('T')[0];
        const pdfFilename = `boarding-control-${flight}-${date}.pdf`;

        // Send email
        const transporter = nodemailer.createTransport({
            host:   EMAIL_CONFIG.smtpHost,
            port:   EMAIL_CONFIG.smtpPort,
            secure: EMAIL_CONFIG.secure,
            auth:   { user: EMAIL_CONFIG.user, pass: EMAIL_CONFIG.pass },
            tls: {
                rejectUnauthorized: !EMAIL_CONFIG.allowSelfSigned
            }
        });

        await transporter.sendMail({
            from:    `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.user}>`,
            to:      recipientEmail,
            subject: `Boarding Control — ${formData.flightInfo.flightNumber} — ${formData.flightInfo.date}`,
            html:    buildHtmlBody(formData),
            attachments: [{
                filename:    pdfFilename,
                content:     pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        console.log(`Email sent → ${recipientEmail} | Flight: ${formData.flightInfo.flightNumber}`);
        res.json({ success: true });

    } catch (error) {
        console.error('Submit error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\nNorwegian BCF server → http://localhost:${PORT}`);
    console.log('Make sure SMTP_USER and SMTP_PASS are set, or update server.js\n');
});
