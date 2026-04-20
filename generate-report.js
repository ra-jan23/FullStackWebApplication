/* eslint-disable @typescript-eslint/no-require-imports */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  SectionType, TableOfContents, TabStopType, TabStopPosition,
} = require("docx");
const fs = require("fs");

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN_TOP = 1440;
const MARGIN_BOTTOM = 1440;
const MARGIN_LEFT = 1701;
const MARGIN_RIGHT = 1417;

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const FONT = { ascii: "Times New Roman" };
const FONT_HEADING = { ascii: "Times New Roman" };
const COLOR_BLACK = "000000";
const COLOR_SECONDARY = "333333";
const LINE_SPACING = 360; // 1.5x

// ─── Utility Functions ──────────────────────────────────────────────────────

function safeText(value, placeholder) {
  if (value === undefined || value === null || value === "" || String(value) === "NaN") {
    return placeholder || "N/A";
  }
  return String(value);
}

function bodyParagraph(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: LINE_SPACING },
    children: [new TextRun({ text, size: 24, color: COLOR_BLACK, font: FONT })],
  });
}

function bodyParagraphRuns(runs) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: LINE_SPACING },
    children: runs,
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 360, line: LINE_SPACING },
    children: [new TextRun({ text, bold: true, size: 32, color: COLOR_BLACK, font: FONT_HEADING })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 240, line: LINE_SPACING },
    children: [new TextRun({ text, bold: true, size: 30, color: COLOR_BLACK, font: FONT_HEADING })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120, line: LINE_SPACING },
    children: [new TextRun({ text, bold: true, size: 28, color: COLOR_BLACK, font: FONT_HEADING })],
  });
}

function emptyPara(spaceBefore = 0) {
  return new Paragraph({ spacing: { before: spaceBefore }, children: [] });
}

// ─── Three-Line Table Builder ───────────────────────────────────────────────

function threeLineTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders: {
        bottom: { style: BorderStyle.SINGLE, size: 2, color: COLOR_BLACK },
        top: NB, left: NB, right: NB,
      },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, bold: true, size: 21, color: COLOR_BLACK, font: FONT })],
      })],
    })),
  });

  const dataRows = rows.map(row => new TableRow({
    cantSplit: true,
    children: row.map((cell, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: String(cell), size: 21, color: COLOR_BLACK, font: FONT })],
      })],
    })),
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BLACK },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BLACK },
      left: NB, right: NB, insideHorizontal: NB, insideVertical: NB,
    },
    rows: [headerRow, ...dataRows],
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120, line: LINE_SPACING },
    keepNext: true,
    children: [new TextRun({ text, bold: true, size: 21, color: COLOR_BLACK, font: FONT })],
  });
}

// ─── Header & Footer Helpers ────────────────────────────────────────────────

function buildHeader(title) {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BLACK } },
      children: [new TextRun({ text: title, size: 18, color: COLOR_SECONDARY, font: FONT })],
    })],
  });
}

function buildPageNumberFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ children: [PageNumber.CURRENT], size: 21, font: FONT }),
      ],
    })],
  });
}

// ─── Cover Layout Helpers ───────────────────────────────────────────────────

function calcTitleLayout(title, maxWidthTwips, preferredPt = 36, minPt = 24) {
  const charWidth = (pt) => pt * 10;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));

  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 5) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }

  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }

  return { titlePt, titleLines: lines };
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];

  const breakAfter = new Set([" ", "-", ":", ",", ".", "/", "&", " and ", " of ", " for ", " in "]);
  const lines = [];
  let remaining = title;

  while (remaining.length > charsPerLine) {
    let breakAt = -1;

    for (let i = Math.min(charsPerLine, remaining.length); i >= Math.floor(charsPerLine * 0.5); i--) {
      if (breakAfter.has(remaining[i])) {
        breakAt = i + 1;
        break;
      }
    }

    if (breakAt === -1) {
      for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
        if (i < remaining.length && remaining[i] === " ") {
          breakAt = i;
          break;
        }
      }
    }

    if (breakAt === -1) breakAt = charsPerLine;

    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);

  if (lines.length > 1 && lines[lines.length - 1].length <= 5) {
    const last = lines.pop();
    lines[lines.length - 1] += " " + last;
  }

  return lines;
}

function calcCoverSpacing(params) {
  const {
    titleLineCount = 1, titlePt = 36, hasSubtitle = false,
    metaLineCount = 0, fixedHeight = 800, pageHeight = 16838,
    marginTop = 0, marginBottom = 0,
  } = params;

  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;

  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;

  const contentHeight = titleHeight + subtitleHeight + metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);

  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);

  return { topSpacing, midSpacing, bottomSpacing };
}

// ─── Build Cover (R5 Clean White) ──────────────────────────────────────────

function buildCover() {
  const title = "PitchVision: A Comprehensive Football Analysis and E-Commerce Platform";
  const subtitle = "Project Report on System Objectives, Requirements, Design, and Implementation";

  const availableWidth = PAGE_WIDTH;
  const { titlePt, titleLines } = calcTitleLayout(title, availableWidth, 32, 22);

  const metaLineCount = 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length,
    titlePt,
    hasSubtitle: true,
    metaLineCount,
    fixedHeight: 400,
    marginTop: 0,
    marginBottom: 0,
  });

  const infoRows = [
    ["Author", "[Student Name]"],
    ["Date", "2025"],
  ];

  const infoTable = new Table({
    width: { size: 55, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: allNoBorders,
    rows: infoRows.map(([label, value]) => new TableRow({
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: allNoBorders,
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: label + ":", size: 28, bold: true, color: COLOR_BLACK, font: FONT })],
          })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLOR_BLACK }, top: NB, left: NB, right: NB },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: value, size: 28, color: COLOR_BLACK, font: FONT })],
          })],
        }),
      ],
    })),
  });

  const accentLine = new Paragraph({
    spacing: { before: 0, after: 0 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "8B7E5A", space: 8 } },
    indent: { left: 3000, right: 3000 },
    children: [],
  });

  const titleParas = [];
  for (let i = 0; i < titleLines.length; i++) {
    titleParas.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: i < titleLines.length - 1 ? 40 : 0, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], bold: true, size: titlePt * 2, color: COLOR_BLACK, font: FONT })],
    }));
  }

  const wrapperTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: PAGE_HEIGHT, rule: "exact" },
      verticalAlign: "top",
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: allNoBorders,
        children: [
          new Paragraph({ spacing: { before: spacing.topSpacing }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300, line: Math.ceil(14 * 23), lineRule: "atLeast" },
            children: [new TextRun({ text: "PitchVision", size: 52, bold: true, color: COLOR_BLACK, font: FONT })],
          }),
          accentLine,
          new Paragraph({ spacing: { before: spacing.midSpacing * 0.3 }, children: [] }),
          ...titleParas,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100, line: Math.ceil(12 * 23), lineRule: "atLeast" },
            children: [new TextRun({ text: subtitle, size: 24, color: "404040", font: FONT })],
          }),
          new Paragraph({ spacing: { before: spacing.midSpacing * 0.5 }, children: [] }),
          infoTable,
          new Paragraph({ spacing: { before: spacing.bottomSpacing }, children: [] }),
        ],
      })],
    })],
  });

  return [wrapperTable];
}

// ─── Table of Contents Section ──────────────────────────────────────────────

function buildTOCSection() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360 },
      children: [new TextRun({
        text: "Table of Contents",
        bold: true, size: 32, color: COLOR_BLACK, font: FONT_HEADING,
      })],
    }),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({
        text: "Note: This Table of Contents is generated via field codes. To ensure page number accuracy after editing, please right-click the TOC and select \"Update Field.\"",
        italics: true, size: 18, color: "888888", font: FONT,
      })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ─── Chapter Content ────────────────────────────────────────────────────────

function buildChapter1() {
  return [
    h1("1. Introduction"),

    bodyParagraph("The global football industry has experienced a remarkable transformation in recent years, driven largely by the rapid advancement of digital technologies and data analytics. As noted by Rossi (2025), artificial intelligence and computer vision algorithms are increasingly reshaping how sports organisations analyse performance, engage fans, and make strategic decisions. The proliferation of wearable sensors, tracking systems, and video analysis tools has generated unprecedented volumes of data, creating a demand for integrated platforms that can synthesise complex datasets into actionable insights."),

    bodyParagraph("Despite the growing availability of football analytics tools, a significant gap remains in the market for comprehensive platforms that seamlessly combine analytical capabilities with e-commerce functionality. Zheng et al. (2025) highlight that computer vision technology for football video analysis has made substantial progress, yet most existing solutions operate in isolation, focusing exclusively on either analytics or commerce. Furthermore, Carey et al. (2024) observe that data analytics adoption across professional football clubs and national federations remains fragmented, with organisations often relying on multiple disconnected systems."),

    bodyParagraph("PitchVision addresses this gap by providing a unified web platform that integrates football analytics, AI-powered features, real-time match simulation, community engagement, and e-commerce functionality within a single application. The platform leverages GLM 4.5 Air, a state-of-the-art large language model, for intelligent chat interactions, match predictions, and quiz generation, alongside z-ai-web-dev-sdk for vision-based formation analysis and web search capabilities. This project report presents the system objectives, requirements, design, and implementation details of PitchVision, demonstrating how modern web technologies can be combined to deliver a comprehensive football analysis and e-commerce experience across twenty-three distinct pages and twenty API routes."),
  ];
}

function buildChapter2() {
  return [
    h1("2. Project Objectives"),

    bodyParagraph("The primary objective of PitchVision is to develop an integrated football analysis and e-commerce web platform that serves as a one-stop solution for football enthusiasts, analysts, and consumers. The project encompasses several key goals that collectively define the scope and ambition of the system."),

    bodyParagraph("First, the platform aims to deliver comprehensive football analytics, including team statistics, player performance metrics, league standings, head-to-head team comparisons, top scorers, and player rankings. These analytical features are enhanced through AI-powered capabilities: Vision Language Models (VLM) via z-ai-web-dev-sdk for formation detection from match images, and GLM 4.5 Air large language model for intelligent chat interactions, match predictions, and football quiz generation. Rossi (2025) emphasises the transformative potential of AI in sports analysis, and PitchVision leverages these advancements across three distinct AI-powered modalities."),

    bodyParagraph("Second, PitchVision incorporates real-time features through WebSocket-based match simulation via a dedicated Socket.IO mini-service operating on port 3004. This real-time capability, facilitated by Socket.IO (Ogundeyi and Yinka-Banjo, 2019), provides an engaging and dynamic user experience with live event feeds including goals, cards, substitutions, and possession changes. Third, the e-commerce module allows users to browse and purchase football-related products with full cart management, multi-step checkout, promo codes, product reviews with star ratings, and order tracking with visual timelines."),

    bodyParagraph("Additionally, the platform provides a community forum for football discussions, a notification system for user alerts, a transfer market page with rumours, completed transfers, and top-valued player data, as well as a news feed powered by AI-driven web search. The project emphasises modern software engineering practices, including type-safe development with TypeScript (Zemskov, 2025), responsive design (Bhanarkar et al., 2023), accessible user interfaces (Acosta-Vargas et al., 2025), and modular component architecture with proper separation of concerns across twenty-three page components."),
  ];
}

function buildChapter3() {
  return [
    h1("3. System Requirements"),

    h2("3.1 Functional Requirements"),

    bodyParagraph("The functional requirements of PitchVision encompass five primary domains: authentication, analytics, AI features, e-commerce, and community engagement. User authentication and registration must support secure JWT-based session management (Dalimunthe et al., 2023), ensuring that user credentials are protected through industry-standard cryptographic practices. The analytics module requires comprehensive data presentation for leagues, teams, players, and matches, with filtering, sorting, and search capabilities, as well as head-to-head team comparison with visual stat bars and match history."),

    bodyParagraph("The AI integration functional requirements include VLM-based formation detection from uploaded match images using z-ai-web-dev-sdk, a GLM 4.5 Air-powered chat assistant for football-related queries with multi-turn conversation support, AI-driven match predictions with probability analysis and tactical factors, and a football quiz generator that produces multiple-choice questions with explanations. The e-commerce module must support product browsing with size guides and comparison, product reviews with star ratings and distribution charts, a shopping cart with quantity controls and promo codes, multi-step checkout with payment form validation, and order tracking with visual timelines."),

    bodyParagraph("Community and content requirements include a transfer market page with rumours, completed transfers, top-valued players, and club spending analysis; a news feed powered by web search; a community forum for football discussions; a notification system with read/unread states; and a user profile page with settings and activity insights. Real-time functionality demands WebSocket-based live match simulation with event-driven updates, as described by Ogundeyi and Yinka-Banjo (2019), operating through a dedicated Socket.IO mini-service."),

    h2("3.2 Non-Functional Requirements"),

    bodyParagraph("Performance requirements mandate that the application achieves fast initial page loads and responsive interactions, leveraging server-side rendering through the Next.js 16 App Router (Kowalczyk and Szandala, 2024). Security requirements include JWT-based authentication, input validation, and protection against common web vulnerabilities. The system must be fully responsive across desktop, tablet, and mobile viewports, adhering to responsive web design best practices (Bhanarkar et al., 2023). Accessibility compliance with WCAG guidelines (Acosta-Vargas et al., 2025) ensures that the platform is usable by individuals with diverse abilities, while dark and light mode support (Gazit et al., 2025) accommodates varying user preferences and environmental conditions."),

    bodyParagraph("The AI model integration must handle rate limiting gracefully, with automatic retry logic for the GLM 4.5 Air free tier (5 requests per minute). The system must maintain zero runtime errors across all pages, as verified through automated testing. Code quality is maintained through ESLint with zero lint errors, and the modular component architecture ensures maintainability as the codebase grows. The real-time mini-service must operate independently on a separate port with proper error handling and reconnection logic."),
  ];
}

function buildChapter4() {
  return [
    h1("4. System Design"),

    h2("4.1 Architecture"),

    bodyParagraph("PitchVision is built upon a Single Page Application (SPA) architecture using the Next.js 16 App Router, which provides a hybrid rendering approach combining server-side rendering (SSR) for initial page loads with client-side navigation for subsequent interactions. As Kowalczyk and Szandala (2024) demonstrate, this architectural choice offers superior SEO capabilities compared to traditional SPAs (Szandala, 2024), while maintaining the rich interactivity that users expect from modern web applications. The application employs a component-based architecture with React 19, enabling modular, reusable UI components that enhance maintainability and development efficiency."),

    bodyParagraph("The architecture follows a clear separation of concerns with three tiers: (1) the Next.js main application on port 3000 handling all pages and API routes, (2) a dedicated Socket.IO mini-service on port 3004 for real-time match simulation, and (3) a Caddy gateway that routes requests to the appropriate service. The Caddy gateway ensures that only port 3000 is exposed externally, with internal service communication handled through the XTransformPort query parameter. State management is handled through Zustand, which provides a lightweight and type-safe solution for managing global application state including authentication, navigation, cart, and UI preferences."),

    bodyParagraph("The backend is implemented through twenty Next.js API Route handlers, covering authentication (register, login, token verification), CRUD operations for products, cart, tickets, highlights, favorites, reviews, and orders, AI feature endpoints (chat, predictions, quiz, analysis, news), and data endpoints (dashboard, transfers, match-events, user profile). AI integration is split across two providers: GLM 4.5 Air via OpenAI-compatible API for text-based LLM tasks (chat, predictions, quiz), and z-ai-web-dev-sdk for vision (formation analysis) and web search (news feed) capabilities."),

    h2("4.2 Database Design"),

    bodyParagraph("The data persistence layer utilises Prisma ORM with SQLite as the underlying database engine. Prisma provides a type-safe database client that eliminates common sources of runtime errors and significantly improves developer productivity. The database schema comprises ten interconnected models that represent the core entities of the platform: User (with avatar and favourite team fields), Product (with sizes, stock, and rating fields), CartItem (with unique constraints on user-product-size combinations), Ticket (with match details and venue information), Highlight (with video metadata and view counts), MatchAnalysis (with formation detection results), FavoriteItem, MatchEvent (for WebSocket match simulation persistence), Review (with star ratings and user-product uniqueness), and Order (with shipping details and item serialisation)."),

    bodyParagraph("The schema employs appropriate Prisma relationships including one-to-many associations (User to CartItem, Ticket, Highlight, etc.) and many-to-one associations (CartItem to Product). Cascading deletes ensure referential integrity when parent records are removed. The MatchEvent model uses auto-incrementing integer IDs for efficient sequential event storage from the WebSocket simulation. The Review model enforces a unique constraint on user-product pairs to prevent duplicate reviews, while the CartItem model uses a composite unique constraint on userId-productId-size to manage cart item variations."),

    h2("4.3 UI/UX Design"),

    bodyParagraph("The user interface is built using Tailwind CSS 4 (Nandan and Sree, 2024) in conjunction with shadcn/ui (shadcn/ui, 2024), providing a utility-first styling approach with a comprehensive component library. The application features a card-based layout pattern for presenting match information, player statistics, and product listings, with consistent navigation through a responsive header that includes a search bar, notification dropdown, and user profile menu. The interface supports both dark and light modes through next-themes, following research by Gazit et al. (2025) on the influence of different background modes on cognitive performance."),

    bodyParagraph("The design employs extensive CSS animations and transitions including glassmorphism effects, gradient borders, stagger-fade animations, breathing blob decorations, spinning dashed circle decorations, scroll-triggered effects, and interactive hover states. Responsive design is achieved through Tailwind CSS breakpoints and fluid layout strategies, with a mobile hamburger menu presenting navigation in a four-column grid layout. The dashboard page features a tabbed interface with Overview, Activity, and Insights tabs, including weekly activity bar charts, spending breakdowns, and an achievements system with earned and unearned badge states. Accessibility considerations include proper semantic HTML, keyboard navigation support, ARIA attributes, and appropriate colour contrast ratios."),
  ];
}

function buildChapter5() {
  return [
    h1("5. Implementation"),

    h2("5.1 Frontend"),

    bodyParagraph("The frontend implementation consists of twenty-three distinct page components, each serving a specific functional purpose within the platform. The core pages include Home, Login, Register, Dashboard (with Overview, Activity, and Insights tabs), Match Center (with league standings, top scorers, player rankings, head-to-head comparison tool, and live match simulation), Store (with product grid, size guide, reviews dialog, product comparison, and favorites), Cart (with quantity controls and promo codes), Checkout (multi-step with shipping, payment, and confirmation), Highlights, Tickets (with stadium info and countdown timers), and AI Analysis (formation detection from uploaded images)."),

    bodyParagraph("Additional pages include AI Chat (with multi-turn conversation, suggested prompts, inline error handling, retry and cancel functionality, and loading timer), Match Predictions (with AI-powered score predictions, probability bars, and tactical analysis), Quiz (football knowledge questions generated by AI with scoring), Transfer Market (with rumours, completed transfers, top-valued players, and club spending tabs), News (AI-powered football news feed), Community (forum for football discussions), Orders (with visual tracking timeline), Favorites (wishlist management), Profile (user settings and stats), and Notifications (centralised notification management). Each page component is stored in the src/components/pages/ directory following the modular architecture established in the codebase refactoring."),

    bodyParagraph("The React 19 component architecture promotes code reusability, with shared components for data display cards, navigation elements, and modal dialogs. TypeScript (Zemskov, 2025) is used throughout the frontend codebase, providing compile-time type checking. Styling is implemented through Tailwind CSS 4 with over fifty custom CSS animation utilities defined in globals.css, including loading-dots, animated-gradient-border, stagger-fade, orbit-decoration, wave-bar, prediction-glow, transfer-arrow, comparison-bar-fill, hero-particle, stat-card-interactive, and many more. The shadcn/ui component library provides accessible UI primitives that are customisable through Tailwind CSS themes. Framer Motion and Recharts are used for advanced animations and data visualisations respectively."),

    h2("5.2 Backend"),

    bodyParagraph("The backend comprises twenty API routes implemented as Next.js API Route handlers. Authentication routes include POST /api/auth/register, POST /api/auth/login, and GET /api/auth/me, following a JWT-based approach (Dalimunthe et al., 2023) with tokens issued upon successful login and validated on protected routes through the Authorization header. The Prisma ORM serves as the data access layer, providing a type-safe query builder that maps directly to the defined database schema."),

    bodyParagraph("Data routes include GET/POST /api/products, GET/POST/DELETE /api/cart, GET/POST /api/tickets, GET /api/highlights, POST /api/analyze, GET /api/dashboard, GET/POST /api/favorites, GET/POST /api/reviews, GET/POST /api/orders, GET /api/user/profile, GET /api/transfers, GET /api/news, GET /api/quiz (POST for quiz generation), GET /api/predictions (POST for prediction), and GET /api/match-events. The AI integration layer is split between two providers: GLM 4.5 Air, accessed through an OpenAI-compatible API endpoint at routeway.ai, handles text-based LLM tasks for chat (multi-turn conversation with session storage), predictions (structured JSON output with score, probabilities, and tactical factors), and quiz (JSON array of questions with options and explanations). A reusable utility module (src/lib/glm.ts) provides runtime environment variable reading, automatic retry logic for rate limiting (429 errors with exponential backoff), and proper TypeScript interfaces."),

    bodyParagraph("The z-ai-web-dev-sdk provides two additional AI capabilities: VLM for formation detection from uploaded match images, and web_search for the news feed. All AI endpoints include proper error handling, timeout management (60 seconds for GLM requests), and fallback parsing for non-JSON responses. The GLM free tier operates at 5 requests per minute, and the retry logic handles rate limiting gracefully with configurable wait times."),

    h2("5.3 Real-Time Features"),

    bodyParagraph("Real-time match simulation is implemented through a dedicated Socket.IO mini-service operating on port 3004, completely separate from the main Next.js application. This architectural decision ensures that real-time processing does not impact the performance of the main application server. The mini-service simulates a football match (e.g., AC Milan vs Juventus) with realistic event generation including goals, yellow and red cards, substitutions, fouls, corners, and possession changes, each with appropriate minute timestamps, team assignments, and player names."),

    bodyParagraph("Socket.IO (Socket.IO, 2024) was selected for its robust WebSocket abstraction layer, which provides automatic fallback to HTTP long-polling, room-based event broadcasting, and reconnection handling. The client-side integration uses the Socket.IO client library to establish and maintain connections, updating the Match Center UI dynamically as match events are received with color-coded event types (green for goals, yellow for cards, blue for substitutions, etc.). The Caddy gateway forwards WebSocket connections to the mini-service using the XTransformPort query parameter, ensuring seamless real-time communication within the unified port 3000 external interface."),
  ];
}

function buildChapter6() {
  return [
    h1("6. Testing and Evaluation"),

    bodyParagraph("The testing and evaluation of PitchVision followed a multi-layered quality assurance approach encompassing static type checking through TypeScript, runtime error monitoring, ESLint static analysis, and end-to-end functional testing. TypeScript compilation ensured that type errors were detected at build time, eliminating an entire category of potential runtime failures. The Prisma ORM further contributed to data access reliability by providing type-safe database queries that are validated against the schema at compile time."),

    bodyParagraph("End-to-end testing was conducted using the agent-browser automated testing tool, which verified critical user flows across all twenty-three pages. Testing covered page navigation and rendering, data display accuracy, authentication workflows (login and registration with demo credentials), e-commerce operations (product browsing, cart management, checkout, and order tracking), AI features (chat interactions with GLM 4.5 Air, formation analysis with VLM, match predictions, and quiz generation), real-time match simulation via WebSocket, community features, notification system, transfer market data presentation, and responsive design across viewport sizes. Each testing round confirmed zero lint errors, zero compile errors, zero runtime errors, and zero console errors."),

    bodyParagraph("API endpoint verification confirmed that all twenty routes return correct HTTP status codes and well-formed JSON responses. The GLM 4.5 Air integration was specifically tested for response quality, rate limiting behaviour, and retry logic effectiveness under concurrent requests. The WebSocket mini-service was tested for connection stability, event delivery accuracy, and client reconnection behaviour. The comprehensive testing approach, combined with continuous integration through automated cron-based review cycles, ensures that the application maintains high quality standards throughout its development lifecycle."),
  ];
}

// ─── References ─────────────────────────────────────────────────────────────

function buildReferences() {
  const refs = [
    "Rossi, L.F. (2025) 'How AI-based computer vision algorithms are impacting the sports industry: a survey', Discover Artificial Intelligence, 5(1), article 374. Available at: https://link.springer.com/article/10.1007/s44163-025-00586-1.",
    "Zheng, F., Al-Hamid, D.Z., Chong, P.H.J., Yang, C. and Li, X.J. (2025) 'A Review of Computer Vision Technology for Football Videos', Information, 16(5), 355. Available at: https://www.mdpi.com/2078-2489/16/5/355.",
    "Web Application State Management: A Review of Leading React Frameworks (2025) IEEE Software, PP(99), pp.1\u20136. DOI:10.1109/MS.2025.3621269.",
    "Szandala, T. (2024) 'Enhancing SEO in Single-Page Web Applications in Contrast with Multi-Page Applications', IEEE Access, 12, pp.11597\u201311614. DOI:10.1109/ACCESS.2024.3355740.",
    "Dalimunthe, S., Putra, E.H. and Ridha, M.A.F. (2023) 'Restful API Security Using JSON Web Token (JWT) With HMAC-Sha512 Algorithm in Session Management', IT Journal Research and Development, 7(2). Available at: https://journal.uir.ac.id/index.php/ITJRD/article/view/12029.",
    "Bhanarkar, N. et al. (2023) 'Responsive Web Design and Its Impact on User Experience', International Journal. Available at: https://www.researchgate.net/publication/370134359.",
    "Nandan, U. and Sree, U. (2024) 'Comparison of Utility-First CSS Framework', Journal of Information Technology. Available at: http://eprints.intimal.edu.my/2069.",
    "Gazit, T., Tager-Shafrir, T. et al. (2025) 'The dark side of the interface: examining the influence of different background modes on cognitive performance', Ergonomics. DOI:10.1080/00140139.2025.2483451.",
    "Acosta-Vargas, P. et al. (2025) 'Understanding the Experiences of People With and Without Disabilities', Proceedings of the ACM on Human-Computer Interaction, 9(CSCW2). DOI:10.1145/3743704.",
    "Carey, D.L. et al. (2024) 'Data analytics in the football industry: a survey investigating operational frameworks and practices in professional clubs and national federations from around the world', British Journal of Sports Medicine. DOI:10.1080/24733938.2024.2341837.",
    "Zemskov, M. (2025) 'Reliability of the Type System in TypeScript in Software Development', Asian Journal of Research in Computer Science, 18(2), pp.50\u201359. Available at: https://journalajrcos.com/index.php/AJRCOS/article/view/561.",
    "Kowalczyk, K. and Szandala, T. (2024) 'Choosing Between Next.js and React.js: A Developer\u2019s Guide to Modern Web Development', International Journal of Computer Research and Technology. Available at: https://ijcrt.org/papers/IJCRT2507402.pdf.",
    "Ogundeyi, O. and Yinka-Banjo, C. (2019) 'WebSocket in real time application', International Journal. Available at: https://www.researchgate.net/publication/368085936.",
    "Prisma (2024) Prisma ORM: Next-generation database toolkit for TypeScript. Available at: https://www.prisma.io/orm.",
    "Socket.IO (2024) Socket.IO Documentation. Available at: https://socket.io/docs/v4.",
    "shadcn/ui (2024) The Foundation for your Design System. Available at: https://ui.shadcn.com.",
    "Next.js by Vercel (2024) The React Framework. Available at: https://nextjs.org.",
  ];

  return [
    h1("References"),
    ...refs.map(ref => new Paragraph({
      spacing: { line: LINE_SPACING, after: 60 },
      indent: { left: 420, hanging: 420 },
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: ref, size: 21, color: COLOR_BLACK, font: FONT })],
    })),
  ];
}

// ─── Appendices ─────────────────────────────────────────────────────────────

function buildAppendices() {
  // Appendix A: Database Schema
  const dbHeaders = ["Model", "Description", "Key Fields"];
  const dbRows = [
    ["User", "Stores user account information", "id, email, name, password, role, avatar, favoriteTeam"],
    ["Product", "E-commerce product catalog", "id, name, price, image, team, category, sizes, stock, rating"],
    ["CartItem", "Individual items in user carts", "id, userId, productId, quantity, size"],
    ["Ticket", "Match ticket records", "id, userId, match, homeTeam, awayTeam, date, venue, section, seat, price"],
    ["Highlight", "Match highlight videos", "id, userId, title, match, thumbnail, videoUrl, duration, views"],
    ["MatchAnalysis", "AI formation detection results", "id, userId, imageUrl, formation, playersCount, analysis, confidence"],
    ["FavoriteItem", "User wishlist items", "id, userId, productId"],
    ["MatchEvent", "WebSocket match simulation events", "id, matchId, type, minute, team, player, description"],
    ["Review", "User product reviews with ratings", "id, userId, productId, rating, title, comment"],
    ["Order", "Purchase order records", "id, userId, items, total, status, address, city, country, postalCode, phone"],
  ];

  // Appendix B: API Routes
  const apiHeaders = ["Method", "Endpoint", "Description"];
  const apiRows = [
    ["POST", "/api/auth/register", "User registration with email and password"],
    ["POST", "/api/auth/login", "User authentication, returns JWT token"],
    ["GET", "/api/auth/me", "Get current authenticated user profile"],
    ["GET/POST", "/api/products", "Fetch all products / Create new product"],
    ["GET/POST/DELETE", "/api/cart", "Fetch, add, update, or remove cart items"],
    ["GET/POST", "/api/tickets", "Fetch available tickets / Book a new ticket"],
    ["GET", "/api/highlights", "Fetch all match highlight videos"],
    ["POST", "/api/analyze", "Upload image for AI formation detection (VLM)"],
    ["GET", "/api/dashboard", "Fetch user dashboard statistics"],
    ["GET/POST", "/api/favorites", "Fetch wishlist / Add product to favorites"],
    ["GET/POST", "/api/reviews", "Fetch reviews by product / Submit a review"],
    ["GET/POST", "/api/orders", "Fetch user orders / Create a new order"],
    ["GET", "/api/user/profile", "Fetch user profile settings"],
    ["GET/POST", "/api/chat", "AI chat endpoint (GLM 4.5 Air, multi-turn)"],
    ["GET/POST", "/api/predictions", "Fetch matches / Generate AI prediction (GLM 4.5 Air)"],
    ["GET/POST", "/api/quiz", "Fetch quiz state / Generate AI quiz questions (GLM 4.5 Air)"],
    ["GET", "/api/transfers", "Fetch transfer market data (rumors, completed, top-valued)"],
    ["GET", "/api/news", "Fetch football news via web search (z-ai-web-dev-sdk)"],
    ["GET", "/api/match-events", "Fetch WebSocket match simulation events"],
  ];

  // Appendix C: Technology Stack
  const techHeaders = ["Category", "Technology", "Purpose"];
  const techRows = [
    ["Frontend Framework", "Next.js 16 (App Router)", "SSR, routing, API routes"],
    ["UI Library", "React 19", "Component-based UI"],
    ["Language", "TypeScript 5", "Type-safe development"],
    ["Styling", "Tailwind CSS 4", "Utility-first CSS"],
    ["Component Library", "shadcn/ui (New York)", "Accessible UI primitives"],
    ["State Management", "Zustand 5", "Global state management"],
    ["Animations", "Framer Motion 12", "Advanced UI animations"],
    ["Charts", "Recharts 2", "Data visualisations"],
    ["ORM", "Prisma 6", "Type-safe database access"],
    ["Database", "SQLite", "Data persistence"],
    ["Real-time", "Socket.IO 4 (mini-service)", "WebSocket communication"],
    ["Authentication", "JWT (JSON Web Token)", "Secure session management"],
    ["AI - Language Model", "GLM 4.5 Air (OpenAI API)", "Chat, predictions, quiz"],
    ["AI - Vision Model", "z-ai-web-dev-sdk (VLM)", "Formation detection"],
    ["AI - Web Search", "z-ai-web-dev-sdk (web_search)", "News feed"],
    ["Gateway", "Caddy", "Reverse proxy, port routing"],
    ["Theme", "next-themes 0.4", "Dark/light mode support"],
    ["Icons", "Lucide React", "UI icon library"],
    ["Markdown", "react-markdown 10", "Render AI chat responses"],
  ];

  return [
    h1("Appendices"),

    h2("Appendix A: Database Schema"),
    bodyParagraph("The Prisma schema defines ten database models with appropriate relationships, constraints, and data types. The schema uses SQLite as the database provider with cascading deletes for referential integrity."),
    tableCaption("Table A-1 Prisma Database Models"),
    threeLineTable(dbHeaders, dbRows, [15, 35, 50]),
    emptyPara(200),

    h2("Appendix B: API Routes"),
    bodyParagraph("The application exposes twenty RESTful API routes through Next.js API Route handlers, covering authentication, data CRUD, AI features, and real-time event retrieval."),
    tableCaption("Table B-1 API Route Definitions"),
    threeLineTable(apiHeaders, apiRows, [15, 35, 50]),
    emptyPara(200),

    h2("Appendix C: Technology Stack Summary"),
    bodyParagraph("The technology stack encompasses frontend frameworks, AI model integrations, database tools, and real-time communication libraries, selected for their modern capabilities, community support, and type-safety features."),
    tableCaption("Table C-1 Technology Stack Overview"),
    threeLineTable(techHeaders, techRows, [20, 35, 45]),
  ];
}

// ─── Document Assembly ──────────────────────────────────────────────────────

async function main() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT,
            size: 24,
            color: COLOR_BLACK,
          },
          paragraph: {
            spacing: { line: LINE_SPACING },
          },
        },
        heading1: {
          run: { font: FONT_HEADING, size: 32, bold: true, color: COLOR_BLACK },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 360, line: LINE_SPACING },
          },
        },
        heading2: {
          run: { font: FONT_HEADING, size: 30, bold: true, color: COLOR_BLACK },
          paragraph: { spacing: { before: 360, after: 240, line: LINE_SPACING } },
        },
        heading3: {
          run: { font: FONT_HEADING, size: 28, bold: true, color: COLOR_BLACK },
          paragraph: { spacing: { before: 240, after: 120, line: LINE_SPACING } },
        },
      },
    },
    sections: [
      // Section 1: Cover
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
          },
        },
        children: buildCover(),
      },
      // Section 2: TOC - Roman numerals
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
            margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT, header: 850, footer: 992 },
            pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
          },
        },
        headers: { default: buildHeader("PitchVision Project Report") },
        footers: { default: buildPageNumberFooter() },
        children: buildTOCSection(),
      },
      // Section 3: Body - Arabic from 1
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
            margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT, header: 850, footer: 992 },
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
        },
        headers: { default: buildHeader("PitchVision Project Report") },
        footers: { default: buildPageNumberFooter() },
        children: [
          ...buildChapter1(),
          ...buildChapter2(),
          ...buildChapter3(),
          ...buildChapter4(),
          ...buildChapter5(),
          ...buildChapter6(),
          ...buildReferences(),
          ...buildAppendices(),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = "/home/z/my-project/PitchVision_Report.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated successfully:", outputPath);
}

main().catch(err => {
  console.error("Error generating document:", err);
  process.exit(1);
});
