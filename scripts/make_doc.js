const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType } = require('/sessions/relaxed-focused-darwin/node_modules/docx');
const fs = require('fs');

const H1 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 320, after: 120 }
});

const H2 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 80 }
});

const Body = (text) => new Paragraph({
  children: [new TextRun({ text, size: 22 })],
  spacing: { after: 80 }
});

const Bullet = (text) => new Paragraph({
  children: [new TextRun({ text, size: 22 })],
  bullet: { level: 0 },
  spacing: { after: 60 }
});

const BulletBold = (label, rest) => new Paragraph({
  children: [
    new TextRun({ text: label, bold: true, size: 22 }),
    new TextRun({ text: rest, size: 22 })
  ],
  bullet: { level: 0 },
  spacing: { after: 60 }
});

const Divider = () => new Paragraph({
  children: [new TextRun({ text: '' })],
  border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
  spacing: { after: 160 }
});

const Spacer = () => new Paragraph({ text: '', spacing: { after: 80 } });

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 22 }
      }
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        run: { bold: true, size: 28, color: '111111', font: 'Calibri' },
        paragraph: { spacing: { before: 320, after: 120 } }
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        run: { bold: true, size: 24, color: '333333', font: 'Calibri' },
        paragraph: { spacing: { before: 240, after: 80 } }
      }
    ]
  },
  sections: [{
    children: [

      // Title block
      new Paragraph({
        children: [new TextRun({ text: "Zo's Good Burger — AI Ordering System", bold: true, size: 32, font: 'Calibri' })],
        spacing: { after: 40 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Project Progress Report', size: 24, color: '555555', font: 'Calibri' })],
        spacing: { after: 40 }
      }),
      new Paragraph({
        children: [new TextRun({ text: 'HKA Connections  ·  May 2026', size: 20, color: '888888', font: 'Calibri' })],
        spacing: { after: 200 }
      }),

      Divider(),

      // Phase 1
      H1('Phase 1 — Foundation (Week 1)'),
      Body('Goal: Build a working proof of concept — a real phone number that answers calls, takes orders in multiple languages, and hands off to staff when needed.'),
      Spacer(),

      H2('What was built'),
      BulletBold('AI ordering assistant live on +1 (313) 631-1176. ', 'Calls to this number are answered by Zo, the AI assistant for Zo\'s Good Burger.'),
      BulletBold('Multilingual support. ', 'The system automatically detects whether the caller is speaking English, Arabic, or Spanish and conducts the entire order in that language.'),
      BulletBold('Full ordering flow. ', 'Zo greets the caller, takes the order from the actual Zo\'s Good Burger menu, confirms it back, asks for a name, and closes the call with an estimated total and pickup time.'),
      BulletBold('Human handoff. ', 'If a caller asks to speak to a person, the system routes the request and notifies the restaurant team immediately.'),
      BulletBold('Webhook infrastructure. ', 'Every order is captured and sent to a backend system, ready to be connected to a POS when the integration is ready.'),

      Spacer(),
      H2('Status at end of Week 1'),
      Bullet('System live and tested in English and Arabic'),
      Bullet('Order flow working end to end'),
      Bullet('Hassan and team completed first round of test calls'),

      Spacer(),
      Divider(),

      // Phase 2
      H1('Phase 2 — Refinements (Week 2)'),
      Body('Goal: Address all feedback from the first round of testing and add order data logging.'),
      Spacer(),

      H2('Fixes applied based on client feedback'),

      BulletBold('Price format. ', 'The AI now says "seventeen dollars and ninety-eight cents" instead of "seventeen point ninety-eight."'),
      BulletBold('Arabic language lock. ', 'The AI will no longer switch to English mid-call. Once Arabic is detected, every response stays in Arabic for the full call, no exceptions.'),
      BulletBold('Arabic dialect support. ', 'The AI now understands and accepts all spoken Arabic dialects — Levantine, Egyptian, Iraqi, Gulf, Yemeni, and others — and responds in a natural, conversational tone instead of formal Arabic.'),
      BulletBold('Menu corrections. ', 'Cajun Fries and Build Your Own Fries added. Three new limited-time specials added (Chicken Caesar Burger, Chicken Caesar Wrap Pro Max, Mushroom Truffle Burger). Sides, sauces, and Mountain Dew added. Menu is now fully synced with the live Toast ordering page.'),
      BulletBold('Customization handling. ', 'The AI now properly understands phrases like "add cheese," "no pickles," or "extra sauce" and records them as part of the order.'),
      BulletBold('Response speed. ', 'Adjusted the assistant\'s response timing to reduce the pause after the caller finishes speaking.'),
      BulletBold('End-of-call message. ', 'Fixed an incorrect closing message that referenced a different brand. Now correctly closes with Zo\'s Good Burger.'),

      Spacer(),
      H2('Order data logging'),
      BulletBold('Airtable connected. ', 'Every order placed through the AI is now automatically logged to an Airtable base with the customer name, order summary, language, and timestamp.'),
      BulletBold('Callback requests logged. ', 'When a caller asks to speak to a human, the request is recorded in a separate table with the caller\'s phone number and reason.'),

      Spacer(),
      H2('Menu management — next step'),
      Body('Currently the menu lives inside the AI\'s instructions. In the next phase, we will move it to a dedicated Airtable sheet so the restaurant can update prices, add items, or remove items directly — without any technical changes needed on our end. Since Toast has paused third-party integrations and launched their own competing voice ordering product, Airtable is the right path forward for menu management.'),

      Spacer(),
      Divider(),

      // Open items
      H1('Open Items'),
      BulletBold('POS integration. ', 'Moving forward with Deliverect as the primary route. Next step: submit integration request at developers.deliverect.com.'),
      BulletBold('Call forwarding. ', 'Waiting on Hassan to confirm what phone system the restaurant currently uses (carrier or VoIP) so we can configure forwarding from the restaurant\'s number to the AI line.'),
      BulletBold('Voice refinement. ', 'The current voice is functional but has some robotic quality in certain phrases. Upgrading the voice model is planned for a future phase once the core flow is fully stable.'),
      BulletBold('Menu in Airtable. ', 'Moving the menu out of the prompt so the restaurant can self-manage updates.'),

      Spacer(),
      Divider(),

      new Paragraph({
        children: [new TextRun({ text: 'Call the live number to test at any time: +1 (313) 631-1176', italics: true, size: 20, color: '666666', font: 'Calibri' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 80 }
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/sessions/relaxed-focused-darwin/mnt/outputs/ZosGoodBurger_Week2_Progress.docx', buf);
  console.log('done');
});
