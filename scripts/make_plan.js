const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, BorderStyle, WidthType, VerticalAlign } = require('/sessions/relaxed-focused-darwin/node_modules/docx');
const fs = require('fs');

const GRAY = 'F2F2F2';
const DARK = '1A1A1A';
const MED = '444444';
const LIGHT = '888888';

const T = (text, opts = {}) => new TextRun({ text, font: 'Calibri', size: 22, color: DARK, ...opts });
const TSmall = (text, opts = {}) => new TextRun({ text, font: 'Calibri', size: 20, color: MED, ...opts });

const Para = (children, spacing = 80) => new Paragraph({ children, spacing: { after: spacing } });
const H1 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 30, font: 'Calibri', color: DARK })],
  spacing: { before: 320, after: 140 }
});
const H2 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 24, font: 'Calibri', color: DARK })],
  spacing: { before: 240, after: 100 }
});
const Spacer = (n = 100) => new Paragraph({ text: '', spacing: { after: n } });

const Bullet = (label, rest = '') => new Paragraph({
  children: [
    new TextRun({ text: label, bold: !!rest, font: 'Calibri', size: 21, color: DARK }),
    new TextRun({ text: rest, font: 'Calibri', size: 21, color: MED })
  ],
  bullet: { level: 0 },
  spacing: { after: 60 }
});

const cell = (text, opts = {}) => new TableCell({
  children: [new Paragraph({
    children: [new TextRun({ text, font: 'Calibri', size: opts.size || 21, bold: opts.bold || false, color: opts.color || DARK })],
    spacing: { after: 0 }
  })],
  shading: opts.shading ? { fill: opts.shading } : undefined,
  verticalAlign: VerticalAlign.CENTER,
  margins: { top: 80, bottom: 80, left: 120, right: 120 },
  width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined
});

const weekRow = (week, label, focus, deliverables, shading) => new TableRow({
  children: [
    cell(week, { bold: true, size: 22, shading, width: 10 }),
    cell(label, { bold: true, size: 21, shading, width: 18 }),
    cell(focus, { size: 20, color: MED, shading, width: 22 }),
    cell(deliverables, { size: 20, color: MED, shading, width: 50 })
  ]
});

const headerRow = new TableRow({
  children: [
    cell('Week', { bold: true, size: 20, shading: GRAY, color: '555555', width: 10 }),
    cell('Theme', { bold: true, size: 20, shading: GRAY, color: '555555', width: 18 }),
    cell('Main Focus', { bold: true, size: 20, shading: GRAY, color: '555555', width: 22 }),
    cell('Key Deliverables', { bold: true, size: 20, shading: GRAY, color: '555555', width: 50 })
  ],
  tableHeader: true
});

const planTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    headerRow,
    weekRow('1', 'Foundation', 'System live', 'AI answers calls in EN/AR/ES · Full ordering flow · Live phone number +1 (313) 631-1176 · Human handoff · Webhook infrastructure', 'FFFFFF'),
    weekRow('2', 'Refinements', 'Feedback fixes', 'Price format fixed · Arabic language lock + dialect support · Cajun Fries + menu sync with Toast · Modifier handling · Order logging in Airtable', 'FFFFFF'),
    weekRow('3', 'Real-call Ready', 'Remove blockers for live use', 'Call forwarding configured (restaurant number → AI line) · Order + end-of-call flow polished · Arabic tested and stable · Edge cases handled (no item, silence, repeat)', 'FAFAFA'),
    weekRow('4', 'Pilot', 'First real customer test', 'Internal pilot with real orders · Fast iteration on anything that breaks · Menu confirmed 100% accurate · Pickup flow confirmed clean · Callback alert working end to end', 'FAFAFA'),
    weekRow('5', 'Phase 1 Close', 'Stable, handoff-ready', 'System stable after pilot feedback · POS integration path confirmed (Deliverect or interim) · Menu moved to Airtable for self-management · Phase 2 roadmap delivered', 'FFFFFF')
  ]
});

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } }
  },
  sections: [{
    properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } },
    children: [

      // Title
      new Paragraph({
        children: [new TextRun({ text: "Zo's Good Burger — AI Ordering System", bold: true, size: 34, font: 'Calibri', color: DARK })],
        spacing: { after: 60 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Phase 1 — 5-Week Plan', size: 24, font: 'Calibri', color: LIGHT })],
        spacing: { after: 300 }
      }),

      // Objective
      H1('Objective'),
      Para([T('Deliver a working AI phone ordering system that Zo\'s Good Burger can use with real customers by end of Week 5. Everything in this plan is scoped around that single goal — features and improvements that are not needed for a real customer call are out of scope for Phase 1.')]),

      Spacer(160),

      // North star
      H1('Definition of Done — Phase 1'),
      Para([T('The system is ready when:')]),
      Bullet('A customer calls the restaurant\'s existing phone number,', ' the AI answers.'),
      Bullet('The AI takes a complete order in English, Arabic, or Spanish', ' without errors.'),
      Bullet('The order is captured', ' and visible to the restaurant team.'),
      Bullet('If something goes wrong,', ' the call is routed to a human immediately.'),

      Spacer(200),

      // Table
      H1('Week-by-Week Breakdown'),
      Para([TSmall('Weeks 1 and 2 are complete. Weeks 3–5 are the remaining scope.')]),
      Spacer(80),
      planTable,

      Spacer(240),

      // Week 3 detail
      H1('Week 3 Detail — Removing the Last Blockers'),
      Para([T('Week 3 is the most critical week. Two things need to happen before any real customer can interact with the system:')]),
      Spacer(60),
      H2('1. Call forwarding'),
      Para([T('Right now, calls to the restaurant\'s existing number do not reach the AI. Hassan needs to confirm what phone system the restaurant uses (standard carrier or VoIP), and we configure the forwarding to +1 (313) 631-1176. Without this, no real customer test is possible.')]),
      H2('2. Order flow polishing'),
      Para([T('Based on Week 2 testing, we refine the edge cases — what happens when the AI mishears something, when a caller goes silent, when an item is out of stock, or when the closing summary is unclear. The goal is a flow clean enough that a real customer has a smooth experience on their first call.')]),

      Spacer(200),

      // Out of scope
      H1('Out of Scope for Phase 1'),
      Para([T('The following are important but not required for the first real customer call. They move to Phase 2:')]),
      Bullet('Full POS integration', ' (Deliverect connection — in progress, but not a dependency for the customer call)'),
      Bullet('Voice quality upgrade', ' (current voice works; naturalness improvements are a Phase 2 refinement)'),
      Bullet('Self-managed menu in Airtable', ' (being set up in Week 5 as a Phase 1 exit deliverable, but not blocking the pilot)'),
      Bullet('Advanced analytics or reporting', ''),
      Bullet('Delivery ordering', ' (pickup only for Phase 1)'),

      Spacer(200),

      // Open dependencies
      H1('Open Dependencies'),
      Para([T('These items require action from Hassan to keep the plan on track:')]),
      Bullet('Phone system type', ' — carrier (AT&T / T-Mobile / Verizon) or VoIP (RingCentral / Google Voice / etc.) — needed to configure call forwarding.'),
      Bullet('Deliverect onboarding', ' — integration request at developers.deliverect.com to confirm timeline for Week 5 POS connection.'),

      Spacer(280),

      new Paragraph({
        children: [new TextRun({ text: 'Live test number: +1 (313) 631-1176  ·  Available now for internal testing', italics: true, size: 19, color: LIGHT, font: 'Calibri' })],
        alignment: AlignmentType.CENTER
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/sessions/relaxed-focused-darwin/mnt/outputs/ZosGoodBurger_Phase1_5WeekPlan.docx', buf);
  console.log('done');
});
