import type {
  CitationRef,
  LuminaDemoWorkspace,
  SummaryDocument,
} from "@/lib/types/workspace";

const sourceId = "src-youtube-511ctokiroU";

const citations: CitationRef[] = [
  { id: "c1", sourceId, segmentIds: ["seg-00"], label: "1", status: "from_source" },
  { id: "c2", sourceId, segmentIds: ["seg-01"], label: "2", status: "from_source" },
  { id: "c3", sourceId, segmentIds: ["seg-02", "seg-04"], label: "5", status: "from_source" },
  { id: "c4", sourceId, segmentIds: ["seg-03", "seg-06"], label: "8", status: "ai_inferred" },
  { id: "c5", sourceId, segmentIds: ["seg-00", "seg-05"], label: "12", status: "needs_verification" },
  { id: "c6", sourceId, segmentIds: ["seg-06"], label: "26", status: "needs_verification" },
];

const englishSummary: SummaryDocument = {
  id: "summary-en",
  sourceId,
  language: "en",
  title: "People Losing Everything to AI vs People Whose Time Becomes Infinite",
  abstract:
    "In the AI era, why does one person lose an entire fortune while another expands their time without limit? Without deep understanding and domain knowledge, blindly trusting what AI suggests can end in failure while those who hold it gain productivity beyond imagination.",
  breadcrumbs: ["Inbox", "AI & Productivity"],
  statusLabel: "Summary ready",
  sourceCoverage: 86,
  citations,
  blocks: [
    {
      id: "toc",
      kind: "table_of_contents",
      citationIds: ["c1", "c2", "c3", "c4"],
      status: "from_source",
      items: [
        { id: "section-1", label: "1. Two lenses that create the divide", citationCount: 4 },
        { id: "section-1-1", label: "1.1 People who blindly trust AI and lose everything", citationCount: 2 },
        { id: "section-1-2", label: "1.2 People who expand time infinitely with AI", citationCount: 2 },
        { id: "section-1-3", label: "1.3 The right approach for the AI era", citationCount: 3 },
      ],
    },
    {
      id: "section-1",
      kind: "heading",
      level: 2,
      text: "1. Two lenses that create the divide",
      citationIds: ["c1"],
      status: "from_source",
    },
    {
      id: "p1",
      kind: "paragraph",
      text:
        "The source frames AI literacy as a divider: one group mistakes fluent AI output for judgment, while another treats AI as leverage only after developing domain knowledge and process discipline.",
      citationIds: ["c1", "c2"],
      status: "from_source",
    },
    {
      id: "diagram",
      kind: "visual",
      visualType: "concept_diagram",
      title: "AI literacy creates widening outcomes",
      subtitle: "AI literacy -> productive leverage -> time freedom",
      generatedFrom: "00:00-01:12",
      sourceSegmentCount: 5,
      citationIds: ["c1", "c2", "c3", "c5"],
      status: "from_source",
      mainConcept: "AI literacy creates widening outcomes",
      nodes: [
        { id: "ai-era", label: "AI era", tone: "neutral" },
        { id: "literacy", label: "AI literacy", tone: "positive" },
        { id: "leverage", label: "Productive leverage", tone: "positive" },
        { id: "freedom", label: "Time freedom", tone: "positive" },
        { id: "illiteracy", label: "AI illiteracy", tone: "negative" },
        { id: "confidence", label: "False confidence", tone: "negative" },
        { id: "loss", label: "Financial loss / Time poverty", tone: "negative" },
      ],
      paths: [
        { id: "upper", label: "Literacy path", tone: "positive", nodeIds: ["literacy", "leverage", "freedom"] },
        { id: "lower", label: "Illiteracy path", tone: "negative", nodeIds: ["illiteracy", "confidence", "loss"] },
      ],
    },
    {
      id: "takeaways",
      kind: "key_takeaways",
      title: "Key takeaways",
      citationIds: ["c1", "c2", "c3"],
      status: "from_source",
      items: [
        {
          id: "takeaway-1",
          title: "Domain knowledge changes the result",
          body: "AI becomes leverage when the user can judge the work, not merely request it.",
          citationIds: ["c1"],
          status: "from_source",
        },
        {
          id: "takeaway-2",
          title: "Automation multiplies the informed user",
          body: "The source connects time expansion to API automation, not just extra chat usage.",
          citationIds: ["c3", "c4"],
          status: "ai_inferred",
        },
        {
          id: "takeaway-3",
          title: "Confidence can accelerate loss",
          body: "Fluent AI answers may hide missing expertise and make weak decisions look finished.",
          citationIds: ["c5"],
          status: "needs_verification",
        },
      ],
    },
    {
      id: "validation",
      kind: "claim_validation",
      title: "Claim validation",
      citationIds: ["c5", "c6"],
      status: "needs_verification",
      validation: {
        id: "claim-1",
        claim: "You can build a viable AI startup without any domain knowledge.",
        sourceEvidence: "The source says AI tooling can dramatically lower the cost of first prototypes.",
        counterEvidence:
          "The same source warns that architecture, judgment, and domain understanding remain necessary.",
        coverageLabel: "2 of 5 supporting segments",
        statusLabel: "Partly supported",
        suggestedFollowUp: "Which parts of this startup idea require expert validation before launch?",
        citationIds: ["c5", "c6"],
        status: "needs_verification",
      },
    },
    {
      id: "actions",
      kind: "action_items",
      title: "Action items",
      citationIds: ["c3", "c6"],
      status: "ai_inferred",
      items: [
        {
          id: "action-1",
          title: "Map where domain judgment is required",
          detail: "Separate tasks AI can draft from decisions a qualified person must verify.",
          citationIds: ["c6"],
        },
        {
          id: "action-2",
          title: "Turn repeated work into an API workflow",
          detail: "Look for one workflow where automation safely expands useful output.",
          citationIds: ["c3"],
        },
      ],
    },
    {
      id: "study",
      kind: "study_notes",
      title: "Study notes",
      citationIds: ["c1", "c3"],
      status: "from_source",
      notes: [
        {
          id: "note-1",
          prompt: "What is the central contrast?",
          answer: "AI literacy turns the same tool from a risk amplifier into a time multiplier.",
          citationIds: ["c1", "c3"],
        },
      ],
    },
  ],
};

const koreanSummary: SummaryDocument = {
  ...englishSummary,
  id: "summary-ko",
  language: "ko",
  title: "AI로 전재산을 날리는 사람들과 시간이 무한해진 사람들",
  abstract:
    "AI 시대, 왜 어떤 사람은 전 재산을 잃고 어떤 사람은 시간을 무한히 확장하는가? AI에 대한 깊이 있는 이해와 도메인 지식이 없다면 AI의 제안을 맹신하다 실패할 수 있으며, 이를 갖춘 사람들은 상상 초월의 생산성을 얻습니다.",
  blocks: englishSummary.blocks.map((block) => {
    if (block.kind === "table_of_contents") {
      return {
        ...block,
        items: [
          { id: "section-1", label: "1. 격차를 만드는 두 가지 시선", citationCount: 4 },
          { id: "section-1-1", label: "1.1 AI를 맹신하여 전 재산을 잃는 사람들", citationCount: 2 },
          { id: "section-1-2", label: "1.2 AI로 시간을 무한히 확장하는 사람들", citationCount: 2 },
          { id: "section-1-3", label: "1.3 AI 시대의 올바른 접근", citationCount: 3 },
        ],
      };
    }
    if (block.kind === "heading") {
      return { ...block, text: "1. 격차를 만드는 두 가지 시선" };
    }
    if (block.kind === "paragraph") {
      return {
        ...block,
        text:
          "이 영상은 AI 문해력이 사람들을 가르는 기준이 된다고 설명합니다. 한쪽은 유창한 AI 답변을 판단력으로 착각하고, 다른 한쪽은 도메인 지식과 절차를 갖춘 뒤 AI를 생산성의 지렛대로 사용합니다.",
      };
    }
    if (block.kind === "visual") {
      return {
        ...block,
        title: "AI 문해력이 만드는 결과의 격차",
        subtitle: "AI 문해력 -> 생산성 레버리지 -> 시간의 자유",
        mainConcept: "AI 문해력이 만드는 결과의 격차",
      };
    }
    if (block.kind === "key_takeaways") {
      return {
        ...block,
        title: "핵심 요점",
        items: [
          {
            id: "takeaway-1",
            title: "도메인 지식이 결과를 바꿉니다",
            body: "AI는 사용자가 결과를 판단할 수 있을 때 비로소 지렛대가 됩니다.",
            citationIds: ["c1"],
            status: "from_source" as const,
          },
          {
            id: "takeaway-2",
            title: "자동화는 준비된 사용자를 증폭합니다",
            body: "시간 확장은 단순한 채팅 사용량이 아니라 API 자동화와 연결됩니다.",
            citationIds: ["c3", "c4"],
            status: "ai_inferred" as const,
          },
          {
            id: "takeaway-3",
            title: "확신은 손실을 빠르게 키울 수 있습니다",
            body: "그럴듯한 AI 답변은 부족한 전문성을 감추고 약한 결정을 완성된 것처럼 보이게 합니다.",
            citationIds: ["c5"],
            status: "needs_verification" as const,
          },
        ],
      };
    }
    if (block.kind === "claim_validation") {
      return {
        ...block,
        title: "주장 검증",
        validation: {
          ...block.validation,
          claim: "도메인 지식 없이도 실현 가능한 AI 스타트업을 만들 수 있다.",
          sourceEvidence: "출처는 AI 도구가 첫 프로토타입의 비용을 크게 낮출 수 있다고 말합니다.",
          counterEvidence: "동시에 설계, 보안, 판단에는 여전히 인간의 도메인 이해가 필요하다고 경고합니다.",
          coverageLabel: "근거 세그먼트 5개 중 2개",
          statusLabel: "부분적으로 근거 있음",
          suggestedFollowUp: "이 아이디어에서 출시 전 전문가 검증이 필요한 부분은 무엇인가?",
        },
      };
    }
    if (block.kind === "action_items") {
      return {
        ...block,
        title: "실행 항목",
        items: [
          {
            id: "action-1",
            title: "도메인 판단이 필요한 지점을 표시하기",
            detail: "AI가 초안을 만들 수 있는 일과 전문가가 검증해야 하는 결정을 나눕니다.",
            citationIds: ["c6"],
          },
          {
            id: "action-2",
            title: "반복 작업을 API 흐름으로 전환하기",
            detail: "안전하게 유용한 산출물을 늘릴 수 있는 자동화 흐름 하나를 찾습니다.",
            citationIds: ["c3"],
          },
        ],
      };
    }
    if (block.kind === "study_notes") {
      return {
        ...block,
        title: "학습 노트",
        notes: [
          {
            id: "note-1",
            prompt: "핵심 대비는 무엇인가?",
            answer: "AI 문해력은 같은 도구를 위험 증폭기에서 시간 증폭기로 바꿉니다.",
            citationIds: ["c1", "c3"],
          },
        ],
      };
    }
    return block;
  }),
};

export const luminaDemo: LuminaDemoWorkspace = {
  source: {
    id: sourceId,
    type: "youtube",
    title: {
      en: englishSummary.title,
      ko: koreanSummary.title,
    },
    url: "https://www.youtube.com/watch?v=511ctokiROU",
    creator: "코드팩토리",
    publishedAt: "2026-06-26",
    durationSeconds: 872,
    sourceLanguage: "ko",
    thumbnailLabel: "AI 빈부격차",
    segmentIds: ["seg-00", "seg-01", "seg-02", "seg-03", "seg-04", "seg-05", "seg-06"],
  },
  segments: [
    {
      id: "seg-00",
      sourceId,
      index: 0,
      startTime: "00:00",
      endTime: "00:06",
      language: "ko",
      text: "지금 AI에 대한 지식이 굉장히 부족한데 AI가 시키는 대로 창업해 가지고 전 재산 날리는 사례들이 막 나오고 있거든요.",
      translation: {
        en: "AI knowledge is severely lacking right now, yet people start companies on whatever AI tells them and lose their entire fortune. Those cases keep appearing.",
      },
      citationLabel: "1",
      linkedBlockIds: ["p1", "diagram", "validation"],
    },
    {
      id: "seg-01",
      sourceId,
      index: 1,
      startTime: "00:06",
      endTime: "00:14",
      language: "ko",
      text: "사회적 문제가 돼서 PD 수첩에서도 나왔는데 반대로 AI에 대한 이해도가 높은 사람들은 시간을 사실상 무한으로 확장하고 있어요.",
      translation: {
        en: "It became a social problem, even covered on investigative TV. Conversely, people with high AI fluency are expanding their time almost infinitely.",
      },
      citationLabel: "2",
      linkedBlockIds: ["p1", "takeaways"],
    },
    {
      id: "seg-02",
      sourceId,
      index: 2,
      startTime: "00:14",
      endTime: "00:16",
      language: "ko",
      text: "그들만의 타임 머신이 있는 거나 마찬가지예요.",
      translation: { en: "It is as if they have their own time machine." },
      citationLabel: "5",
      linkedBlockIds: ["diagram", "study"],
    },
    {
      id: "seg-03",
      sourceId,
      index: 3,
      startTime: "00:16",
      endTime: "00:19",
      language: "ko",
      text: "그냥 평행 우주를 관리하고 있다고 생각하시면 돼요.",
      translation: { en: "Think of it as managing a parallel universe." },
      citationLabel: "8",
      linkedBlockIds: ["diagram"],
    },
    {
      id: "seg-04",
      sourceId,
      index: 4,
      startTime: "00:19",
      endTime: "00:23",
      language: "ko",
      text: "특히나 토큰이 무한해 버리면 그냥 일반인이 따라갈 수 없는 생산성을 갖게 될 겁니다.",
      translation: {
        en: "Especially once your tokens are effectively infinite, you gain productivity ordinary people simply cannot match.",
      },
      citationLabel: "12",
      linkedBlockIds: ["diagram", "takeaways"],
    },
    {
      id: "seg-05",
      sourceId,
      index: 5,
      startTime: "00:23",
      endTime: "00:31",
      language: "ko",
      text: "이건 단순히 계정을 여러 개 사서 200달러짜리 토큰 다섯 개를 이번 주에 다 썼다, 이런 정도의 문제가 아니에요.",
      translation: {
        en: "This is not merely about buying several accounts and burning through five 200-dollar token plans in a week.",
      },
      citationLabel: "18",
      linkedBlockIds: ["takeaways"],
    },
    {
      id: "seg-06",
      sourceId,
      index: 6,
      startTime: "00:31",
      endTime: "00:38",
      language: "ko",
      text: "자, 토큰이 무한하다는 건 사실 우리가 API 자동화 관점으로 봐야 되거든요.",
      translation: {
        en: "Now, infinite tokens really has to be viewed through the lens of API automation.",
      },
      citationLabel: "26",
      linkedBlockIds: ["actions", "validation"],
    },
  ],
  summaries: {
    en: englishSummary,
    ko: koreanSummary,
  },
  reportModes: [
    { id: "summary", label: { en: "Summary", ko: "요약" }, status: "ready", tone: "teal" },
    { id: "critical-analysis", label: { en: "Critical analysis", ko: "비판적 분석" }, status: "preview", tone: "amber" },
    { id: "claim-validation", label: { en: "Claim validation", ko: "주장 검증" }, status: "generate", tone: "sage" },
    { id: "action-items", label: { en: "Action items", ko: "실행 항목" }, status: "generate", tone: "teal" },
    { id: "study-notes", label: { en: "Study notes", ko: "학습 노트" }, status: "generate", tone: "amber" },
    { id: "founder", label: { en: "Founder mode", ko: "창업자 모드" }, status: "pro", tone: "forest" },
    { id: "developer", label: { en: "Developer mode", ko: "개발자 모드" }, status: "pro", tone: "teal" },
    { id: "investor", label: { en: "Investor mode", ko: "투자자 모드" }, status: "soon", tone: "coral" },
  ],
  highlights: [
    {
      id: "h1",
      category: "key_claim",
      text: "Domain knowledge turns AI into leverage; its absence turns AI into a faster path to loss.",
      provenance: "Key takeaways · 03",
      citationIds: ["c1", "c2"],
      status: "from_source",
    },
    {
      id: "h2",
      category: "important_quote",
      text: "토큰이 무한해 버리면 일반인이 따라갈 수 없는 생산성을 갖게 됩니다.",
      provenance: "00:19 · transcript",
      citationIds: ["c3"],
      status: "from_source",
    },
    {
      id: "h3",
      category: "needs_validation",
      text: "You can build a viable AI startup without any domain knowledge.",
      provenance: "Claim validation · §1.1",
      citationIds: ["c5", "c6"],
      status: "needs_verification",
    },
    {
      id: "h4",
      category: "user_note",
      text: "Compare against the developer-mode report before sharing with the team.",
      provenance: "Added by you · today",
      citationIds: [],
      status: "ai_inferred",
    },
  ],
  assistantPrompts: [
    { id: "p-validate", label: "Validate this idea", description: "Pressure-test the central claim against the source.", mode: "critical" },
    { id: "p-simple", label: "Explain more simply", description: "Turn the idea into one plain-language explanation.", mode: "standard" },
    { id: "p-actions", label: "Turn into action items", description: "Extract concrete next steps from the note.", mode: "action" },
    { id: "p-founder", label: "Generate founder analysis", description: "Frame the risks for a startup team.", mode: "founder" },
    { id: "p-study", label: "Create study notes", description: "Create recall prompts and answers.", mode: "study" },
    { id: "p-compare", label: "Compare with external sources", description: "Mark what needs web validation later.", mode: "critical" },
  ],
  assistantMessages: [
    {
      id: "m1",
      role: "assistant",
      body: "I can ground every answer in this source. Want me to pressure-test the main claim first?",
      bodyKo: "이 출처를 근거로 답변합니다. 핵심 주장을 먼저 검증해드릴까요?",
      citationIds: ["c6"],
      scope: "source",
    },
  ],
};
