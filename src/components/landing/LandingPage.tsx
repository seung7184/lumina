"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  FileText,
  Headphones,
  Rss,
  Video,
  BookOpen,
  Sparkles,
  Search,
  LayoutGrid,
  Highlighter,
  FolderOpen,
  MessageSquare,
  Zap,
  ChevronDown,
  ChevronUp,
  Globe,
  ArrowRight,
  CheckCircle2,
  Brain,
  Layers,
  ListChecks,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="landing">
      <Navbar />
      <HeroSection />
      <UnlimitedBrainSection />
      <DemoSection />
      <SocialProofSection />
      <FeaturesHeading />
      <FeatureCards />
      <TestimonialQuote />
      <KnowledgeHubSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="landing-nav">
      <div className="landing-nav__inner">
        <Link href="/" className="landing-nav__brand" aria-label="Lumina home">
          <span className="brand-mark">L</span>
          <strong>Lumina</strong>
        </Link>
        <nav className="landing-nav__links" aria-label="Main navigation">
          <a href="#features">Product</a>
          <a href="#solutions">Solutions</a>
          <a href="#testimonials">Resources</a>
          <a href="#faq">Pricing</a>
        </nav>
        <div className="landing-nav__actions">
          <button type="button" className="icon-button" aria-label="Language">
            <Globe size={16} />
          </button>
          <Link href="/workspace" className="landing-cta-sm">Get started</Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="landing-hero">
      <div className="landing-hero__badge">
        <CheckCircle2 size={14} />
        <span>1.2M+ users reached</span>
      </div>
      <h1 className="landing-hero__title">
        <span className="landing-hero__icon landing-hero__icon--youtube">
          <Video size={36} />
        </span>
        Just Save and Subscribe.
        <span className="landing-hero__icon landing-hero__icon--rss">
          <Rss size={28} />
        </span>
        <br />
        Never miss insights.
      </h1>
      <p className="landing-hero__subtitle">
        Meet Lumina — your AI-native content distilling assistant.
        <br />
        Drop in any Youtube video, book, PDF, article or audio and get instant
        <br />
        summaries, clear explanations, and deeper insights in seconds.
      </p>
      <div className="landing-hero__icons-row">
        <span className="landing-hero__icon landing-hero__icon--book">
          <BookOpen size={28} />
        </span>
        <Link href="/workspace" className="landing-cta-lg">Start for free</Link>
        <span className="landing-hero__icon landing-hero__icon--audio">
          <Headphones size={28} />
        </span>
      </div>
    </section>
  );
}

function UnlimitedBrainSection() {
  return (
    <section className="landing-brain">
      <div className="landing-brain__content">
        <div className="landing-brain__icon-wrap">
          <Layers size={32} />
        </div>
        <h2>Unlimited Brain</h2>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section className="landing-demo" id="demo">
      <div className="landing-demo__window">
        <div className="landing-demo__left">
          <div className="landing-demo__source-info">
            <div className="landing-demo__channel">
              <Play size={14} />
              <span>코드팩토리</span>
              <small>Jun 26, 2026</small>
            </div>
          </div>
          <p className="landing-demo__label">Script</p>
          <div className="landing-demo__transcript">
            <TranscriptLine time="0:00" speaker="코드팩토리" text="지금 AI에 대한 지식이 굉장히 부족한데 AI가 시키는 대로 창업해 가지고 전 재산 날리는 사례들이 막 나오고 있거든요." />
            <TranscriptLine time="0:06" text="사회적 문제가 돼서 PD 수첩에서도 나왔는데 반대로 AI에 대한 이해도가 높은 사람들은 시간을 사실상 무한으로 확장하고 있어요." />
            <TranscriptLine time="0:14" text="그들만의 타임 머신이 있는 거나 마찬가지예요." />
          </div>
        </div>
        <div className="landing-demo__right">
          <div className="landing-demo__summary-header">
            <p>People Losing Everything to AI vs People Whose Time Becomes Infinite</p>
          </div>
          <div className="landing-demo__tabs">
            <button type="button" className="landing-demo__tab is-active">
              <Sparkles size={13} />
              Explain
            </button>
            <button type="button" className="landing-demo__tab">
              <MessageSquare size={13} />
              Lily Chat
            </button>
          </div>
          <div className="landing-demo__contents">
            <p className="landing-demo__contents-title">Contents</p>
            <ol className="landing-demo__contents-list">
              <li>Two lenses that create the divide</li>
              <li className="landing-demo__contents-sub">1.1 People who blindly trust AI</li>
              <li className="landing-demo__contents-sub">1.2 People who expand time with AI</li>
              <li>The right approach for the AI era</li>
              <li className="landing-demo__contents-sub">2.1 Domain knowledge changes the result</li>
              <li className="landing-demo__contents-sub">2.2 Automation multiplies the informed user</li>
            </ol>
          </div>
          <div className="landing-demo__chat-input">
            <input type="text" placeholder="Ask anything (Q&A, write, edit)" readOnly />
            <button type="button" aria-label="Send">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <p className="landing-demo__footnote">* Lumina demo screen. Real product has more features.</p>
    </section>
  );
}

function TranscriptLine({ time, speaker, text }: { time: string; speaker?: string; text: string }) {
  return (
    <div className="landing-demo__line">
      <span className="landing-demo__time">{time}</span>
      <div>
        {speaker && <strong>{speaker}</strong>}
        <p>{text}</p>
      </div>
    </div>
  );
}

function SocialProofSection() {
  const logos = [
    "Google", "Amazon", "Microsoft", "Samsung", "Hyundai",
    "Sendbird", "PwC", "Harvard", "UC Berkeley", "Worldcoin",
  ];
  return (
    <section className="landing-social-proof">
      <p>Loved by 1.2M+ leaders, investors, researchers, learners</p>
      <div className="landing-logos">
        {logos.map((name) => (
          <span key={name} className="landing-logo">{name}</span>
        ))}
      </div>
    </section>
  );
}

function FeaturesHeading() {
  return (
    <section className="landing-features-heading" id="features">
      <h2>Your job? Surprisingly easy.</h2>
      <p>Genius mode : on <Zap size={20} /></p>
      <div className="landing-features-heading__actions">
        <Link href="/workspace" className="landing-cta-dark">
          <Globe size={14} />
          Chrome Extension
        </Link>
        <Link href="/workspace" className="landing-cta-dark">
          <FileText size={14} />
          App
        </Link>
      </div>
      <div className="landing-features-heading__tabs">
        <span className="landing-source-tab is-active">
          <Video size={14} />
          YouTube
        </span>
        <span className="landing-source-tab">
          <Rss size={14} />
          RSS
        </span>
      </div>
    </section>
  );
}

function FeatureCards() {
  const features = [
    {
      num: 1,
      total: 5,
      title: "Summary done right, finally",
      body: "Structured like your best colleague wrote it — never missing key nuances, with relevant visuals and thorough source references grounded in every claim.",
      cta: "Start Summarizing",
    },
    {
      num: 2,
      total: 5,
      title: "Expand beyond what you read alone",
      body: "Auto-generated reports with background knowledge, opposing viewpoints for balanced thinking, and actionable items tailored to your context. Plus mind maps, infographics, quizzes, flashcards, and more.",
      cta: "Start Expanding",
    },
    {
      num: 3,
      total: 5,
      title: "Translate anything, instantly",
      body: "Real-time bilingual transcripts and summaries in your language. Switch between source and target languages seamlessly while maintaining context and nuance.",
      cta: "Start Translating",
    },
    {
      num: 4,
      total: 5,
      title: "Chat with someone who knows you",
      body: "Expand your thinking by chatting with Lumina — an AI that remembers you and proactively starts conversations based on what you consume and care about.",
      cta: "Start Chatting",
    },
    {
      num: 5,
      total: 5,
      title: "What you should read, Now",
      body: "Discovers, evaluates, and recommends valuable sources based on your interests, reading history, and professional context. Never miss what matters.",
      cta: "Start Discovering",
    },
  ];
  return (
    <section className="landing-feature-cards" id="solutions">
      {features.map((f) => (
        <div key={f.num} className="landing-feature-card">
          <div className="landing-feature-card__content">
            <span className="landing-feature-card__num">
              {f.num} <small>/ {f.total}</small> {f.title}
            </span>
            <h3>{f.body}</h3>
            <Link href="/workspace" className="landing-cta-dark landing-cta-sm-pill">{f.cta}</Link>
          </div>
          <div className="landing-feature-card__visual" />
        </div>
      ))}
    </section>
  );
}

function TestimonialQuote() {
  return (
    <section className="landing-quote">
      <blockquote>
        &ldquo;I&rsquo;m starting to get into a habit of reading everything (blogs, articles, book,...) with LLMs.
        Usually pass 1 is manual, then pass 2 &ldquo;explain/summarize&rdquo;, pass 3 Q&A. I usually end up
        with a better/deeper understanding than if I moved on.&rdquo;
      </blockquote>
      <cite>— Andrej Karpathy (OpenAI founding member)</cite>
    </section>
  );
}

function KnowledgeHubSection() {
  const items = [
    { icon: <Highlighter size={20} />, title: "Highlight", desc: "One-click highlight & memo on what matters most to you." },
    { icon: <FolderOpen size={20} />, title: "Inbox & Collections", desc: "Evaluate source importance and organize your knowledge." },
    { icon: <LayoutGrid size={20} />, title: "Multi-source", desc: "Compare and connect insights across multiple sources." },
    { icon: <Search size={20} />, title: "Smart Search", desc: "Find anything across all your saved sources instantly." },
    { icon: <Brain size={20} />, title: "Knowledge Graph", desc: "Auto-connected concepts across all your content." },
    { icon: <ListChecks size={20} />, title: "Action Items", desc: "Extract and track actionable next steps from any source." },
  ];
  return (
    <section className="landing-hub">
      <h2>Everything the knowledge hub should have</h2>
      <div className="landing-hub__grid">
        {items.map((item) => (
          <div key={item.title} className="landing-hub__card">
            <span className="landing-hub__icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const roles = ["Leadership", "Research", "Investment", "Consulting", "Educator", "Student", "Creator", "Product", "Engineering", "Marketing", "Medical"];
  const [activeRole, setActiveRole] = useState("Leadership");

  const testimonials: Record<string, { quote: string; name: string; title: string }[]> = {
    Leadership: [
      { quote: "Lumina is my second brain. It structures my thoughts so I can focus on what matters.", name: "Young Jeon", title: "Whoyaho (60M+ game downloads)" },
      { quote: "I deal with a lot of data and materials on technology, capital markets, and startups. Lumina has easily tripled the amount of information I can actually absorb and work through.", name: "Jinho Heo", title: "Partner, Han River Partners" },
      { quote: "As a business leader, it's been genuinely helpful for keeping up with trends and drawing real insights. I'd definitely recommend it to anyone who feels the same need.", name: "Kyungjung Min", title: "CEO, KOAS ($60M+ annual revenue)" },
    ],
    Research: [
      { quote: "The source-grounded approach means every insight is traceable. Perfect for academic integrity.", name: "Dr. Min Park", title: "Research Fellow, KAIST" },
      { quote: "Lumina's citation tracking saves hours of manual reference work in every paper review.", name: "Sarah Chen", title: "Associate Professor, Stanford" },
      { quote: "Cross-language research has never been this seamless. Korean and English sources in one view.", name: "Prof. Kim", title: "Seoul National University" },
    ],
  };

  const active = testimonials[activeRole] ?? testimonials.Leadership;

  return (
    <section className="landing-testimonials" id="testimonials">
      <div className="landing-testimonials__roles">
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            className={`landing-role-chip ${activeRole === role ? "is-active" : ""}`}
            onClick={() => setActiveRole(role)}
          >
            {role}
          </button>
        ))}
      </div>
      <div className="landing-testimonials__grid">
        {active.map((t) => (
          <div key={t.name} className="landing-testimonial-card">
            <p>&ldquo;{t.quote}&rdquo;</p>
            <div className="landing-testimonial-card__author">
              <div className="avatar">{t.name[0]}</div>
              <div>
                <strong>{t.name}</strong>
                <small>{t.title}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "What is Lumina?", a: "Lumina is an AI research and consulting tool that summarizes, extracts insights, and answers questions based on your materials. It focuses on understanding your documents, links, and sources to surface what matters." },
    { q: "Who is Lumina best for?", a: "Lumina is designed for leaders, researchers, investors, consultants, educators, students, creators, and anyone who consumes large amounts of content and needs to extract actionable insights quickly." },
    { q: "What materials can I upload?", a: "You can upload YouTube videos, PDFs, articles, books, audio files, and web pages. Lumina processes them all with source-grounded AI to deliver accurate summaries and insights." },
    { q: "Is Lumina free to use?", a: "Lumina offers a free tier to get started. Premium features like advanced reports, multi-source analysis, and team collaboration are available on paid plans." },
    { q: "How does source grounding work?", a: "Every claim, takeaway, and insight is traced back to the original source material with citation markers, so you can verify accuracy and context at any time." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="landing-faq" id="faq">
      <div className="landing-faq__inner">
        <h2>Frequently<br />Asked<br />Questions</h2>
        <div className="landing-faq__list">
          {faqs.map((faq, i) => (
            <div key={faq.q} className={`landing-faq__item ${openIndex === i ? "is-open" : ""}`}>
              <button
                type="button"
                className="landing-faq__question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span>{faq.q}</span>
                {openIndex === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openIndex === i && (
                <div className="landing-faq__answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="landing-cta-section">
      <h2>Start discovering insights today</h2>
      <Link href="/workspace" className="landing-cta-lg">Get started</Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <Link href="/" className="landing-nav__brand" aria-label="Lumina home">
            <span className="brand-mark">L</span>
            <strong>Lumina</strong>
          </Link>
          <small>Source-grounded AI research workspace</small>
          <small>&copy; 2025 Lumina</small>
        </div>
        <div className="landing-footer__col">
          <strong>Learn</strong>
          <a href="#faq">Help Center</a>
          <a href="#features">Blog</a>
          <a href="#testimonials">Ambassador Program</a>
        </div>
        <div className="landing-footer__col">
          <strong>Company</strong>
          <a href="#features">Careers</a>
          <a href="#faq">Terms of Service</a>
          <a href="#faq">Privacy Policy</a>
        </div>
        <div className="landing-footer__col">
          <strong>Connect</strong>
          <a href="#features">Discord</a>
          <a href="#features">YouTube</a>
          <a href="#features">X (Twitter)</a>
          <a href="#features">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
