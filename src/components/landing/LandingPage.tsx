"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Play,
  FileText,
  Headphones,
  Video,
  BookOpen,
  Sparkles,
  Search,
  LayoutGrid,
  FolderOpen,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Globe,
  ArrowRight,
  Layers,
  ListChecks,
  Shield,
  Languages,
  Target,
  Link2,
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
        <Shield size={14} />
        <span>Source-grounded &middot; Privacy-first &middot; Bilingual</span>
      </div>
      <h1 className="landing-hero__title">
        <span className="landing-hero__icon landing-hero__icon--youtube">
          <Video size={36} />
        </span>
        Turn sources into decisions.
        <span className="landing-hero__icon landing-hero__icon--rss">
          <Languages size={28} />
        </span>
        <br />
        In English and Korean.
      </h1>
      <p className="landing-hero__subtitle">
        Lumina is a bilingual AI research workspace that turns long videos, PDFs,
        <br />
        and web pages into source-backed briefs, decisions, and work-ready drafts.
        <br />
        Not another summarizer — understand, verify, and use what you read.
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
        <h2>Source-to-Decision Workspace</h2>
        <p className="landing-brain__subtitle">
          From ingestion to verified insight — every claim traced back to the original source.
        </p>
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
              <span>YouTube / PDF / Web</span>
              <small>Any source</small>
            </div>
          </div>
          <p className="landing-demo__label">Source content</p>
          <div className="landing-demo__transcript">
            <TranscriptLine time="0:00" speaker="Source" text="Drop in any YouTube video, PDF, article, or web page. Lumina extracts and structures the content automatically." />
            <TranscriptLine time="0:06" text="Every claim is linked back to the original source with citation markers, so you can verify accuracy at any time." />
            <TranscriptLine time="0:14" text="Switch between Korean and English seamlessly — understand in your language, produce in any language." />
          </div>
        </div>
        <div className="landing-demo__right">
          <div className="landing-demo__summary-header">
            <p>Deep Brief — source-grounded, bilingual</p>
          </div>
          <div className="landing-demo__tabs">
            <button type="button" className="landing-demo__tab is-active">
              <Sparkles size={13} />
              Brief
            </button>
            <button type="button" className="landing-demo__tab">
              <MessageSquare size={13} />
              Ask
            </button>
          </div>
          <div className="landing-demo__contents">
            <p className="landing-demo__contents-title">Decision Lens</p>
            <ol className="landing-demo__contents-list">
              <li>Executive Brief — key claims with source proof</li>
              <li className="landing-demo__contents-sub">Study Notes — recall prompts and answers</li>
              <li className="landing-demo__contents-sub">Decision Memo — actionable analysis</li>
              <li>Action Checklist — next steps extracted</li>
              <li className="landing-demo__contents-sub">Source Confidence — verified vs unverified</li>
              <li className="landing-demo__contents-sub">Bilingual Output — KR/EN toggle</li>
            </ol>
          </div>
          <div className="landing-demo__chat-input">
            <input type="text" placeholder="Ask anything about this source..." readOnly />
            <button type="button" aria-label="Send">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <p className="landing-demo__footnote">* Lumina workspace — every output is source-grounded and verifiable.</p>
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
  return (
    <section className="landing-social-proof">
      <p>Built for bilingual professionals, researchers, founders, and students</p>
      <div className="landing-logos">
        {["Consultants", "Researchers", "Founders", "Investors", "Students", "Expats", "Educators", "Analysts"].map((name) => (
          <span key={name} className="landing-logo">{name}</span>
        ))}
      </div>
    </section>
  );
}

function FeaturesHeading() {
  return (
    <section className="landing-features-heading" id="features">
      <h2>Read less. Understand more. Act faster.</h2>
      <p>Source-grounded AI workspace <Target size={20} /></p>
      <div className="landing-features-heading__actions">
        <Link href="/workspace" className="landing-cta-dark">
          <Globe size={14} />
          Try Workspace
        </Link>
        <Link href="/workspace" className="landing-cta-dark">
          <FileText size={14} />
          See Demo
        </Link>
      </div>
      <div className="landing-features-heading__tabs">
        <span className="landing-source-tab is-active">
          <Video size={14} />
          YouTube
        </span>
        <span className="landing-source-tab">
          <FileText size={14} />
          PDF
        </span>
        <span className="landing-source-tab">
          <Globe size={14} />
          Web
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
      title: "Deep Brief, not shallow summary",
      body: "Section-by-section digest with key claims, evidence, and nuances preserved. Every important statement linked to the original source — never a 3-line summary that loses context.",
      cta: "Try Deep Brief",
    },
    {
      num: 2,
      total: 5,
      title: "Source Proof on every claim",
      body: "Every claim, takeaway, and insight is traced back to the original source material with citation markers and confidence scores. Verify accuracy and context at any time.",
      cta: "See Source Proof",
    },
    {
      num: 3,
      total: 5,
      title: "Bilingual understanding",
      body: "English source to Korean understanding. Korean notes to English professional output. Preserve original nuance while switching languages seamlessly for work or study.",
      cta: "Try Bilingual Mode",
    },
    {
      num: 4,
      total: 5,
      title: "Ask with source-grounded answers",
      body: "Chat with an AI that only answers from your sources. No hallucination — every response cites specific sections. If it is not in the source, Lumina says so.",
      cta: "Start Asking",
    },
    {
      num: 5,
      total: 5,
      title: "Decision-ready output templates",
      body: "Same source, different purpose. Choose Executive Brief, Study Notes, Decision Memo, Action Checklist, or Email Draft — the output adapts to how you will use it.",
      cta: "Choose Template",
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
    { icon: <Link2 size={20} />, title: "Source Proof", desc: "Every claim linked to original timestamp, page, or paragraph." },
    { icon: <FolderOpen size={20} />, title: "Projects & Collections", desc: "Organize sources by purpose — study, work, research, life admin." },
    { icon: <LayoutGrid size={20} />, title: "Multi-source", desc: "Compare and connect insights across multiple sources." },
    { icon: <Search size={20} />, title: "Smart Search", desc: "Find anything across all your saved sources instantly." },
    { icon: <Shield size={20} />, title: "Privacy-first", desc: "Your sources are not used for model training. Delete anytime." },
    { icon: <ListChecks size={20} />, title: "Action Items", desc: "Extract and track actionable next steps from any source." },
  ];
  return (
    <section className="landing-hub">
      <h2>Everything the research workspace should have</h2>
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
  const roles = ["Professional", "Research", "Student", "Founder", "Consultant", "Investor", "Educator", "Expat"];
  const [activeRole, setActiveRole] = useState("Professional");

  const testimonials: Record<string, { quote: string; name: string; title: string }[]> = {
    Professional: [
      { quote: "Lumina turns 2-hour meetings and 50-page reports into actionable briefs I can use immediately. The bilingual mode is a game-changer for my cross-border work.", name: "Sujin Lee", title: "Strategy Consultant, Amsterdam" },
      { quote: "I deal with materials across Korean and English daily. Lumina lets me understand in Korean and produce in English — no context lost.", name: "Jinho Heo", title: "Partner, Han River Partners" },
      { quote: "The source-grounding means I can trust every insight. No more second-guessing AI-generated summaries.", name: "Emma van der Berg", title: "Senior Analyst, Rotterdam" },
    ],
    Research: [
      { quote: "The source-grounded approach means every insight is traceable. Perfect for academic integrity.", name: "Dr. Min Park", title: "Research Fellow, KAIST" },
      { quote: "Cross-language research has never been this seamless. Korean and English sources in one workspace.", name: "Sarah Chen", title: "PhD Candidate, TU Delft" },
      { quote: "I can finally process Dutch government research papers and understand them in Korean. Then write my findings in English.", name: "Hyunwoo Kim", title: "Postdoc, Leiden University" },
    ],
    Student: [
      { quote: "Lecture recordings, textbook PDFs, research papers — Lumina processes them all and creates study notes I can actually use for exams.", name: "Minji Choi", title: "MSc Computer Science, TU Eindhoven" },
      { quote: "Understanding Dutch university lectures used to take me hours. Now I get bilingual study notes in minutes.", name: "Jiho Park", title: "BSc Economics, UvA" },
      { quote: "The Decision Memo template helps me structure my thesis arguments with proper source citations.", name: "Lisa de Vries", title: "MA International Relations, Groningen" },
    ],
  };

  const active = testimonials[activeRole] ?? testimonials.Professional;

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
    { q: "What is Lumina?", a: "Lumina is a bilingual AI research workspace that turns long videos, PDFs, and web pages into source-backed briefs, decisions, and work-ready drafts. It focuses on understanding, verifying, and applying what you read — not just summarizing it." },
    { q: "Who is Lumina best for?", a: "Bilingual professionals, researchers, students, founders, consultants, and expats who consume content in English, Korean, or Dutch and need to produce verified, actionable outputs. Especially useful for anyone working across languages in Europe." },
    { q: "What sources can I use?", a: "YouTube videos (via transcript extraction), web pages, PDFs, and pasted text. Lumina processes them all with source-grounded AI to deliver deep briefs with full citation tracking." },
    { q: "How is Lumina different from other summarizers?", a: "Most tools give you a 3-line summary and you still need to read the original. Lumina gives you a deep, section-by-section brief with every claim linked to the source. Plus bilingual understanding, decision-ready templates, and source confidence scoring." },
    { q: "Is my data private?", a: "Yes. Your sources are not used for model training. You can delete any source and its generated content at any time. Lumina is designed with EU privacy standards (GDPR) in mind from day one." },
    { q: "Is Lumina free to use?", a: "Lumina offers a free tier with up to 5 sources per month. Premium plans with unlimited sources, advanced templates, and collections start at €9/month." },
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
      <h2>Turn your sources into decisions</h2>
      <p className="landing-cta-section__subtitle">Understand, verify, and use what you read — in English and Korean.</p>
      <Link href="/workspace" className="landing-cta-lg">Get started free</Link>
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
          <small>Bilingual source-to-decision workspace</small>
          <small>&copy; 2025 Lumina. EU-friendly data handling.</small>
        </div>
        <div className="landing-footer__col">
          <strong>Product</strong>
          <a href="#features">Features</a>
          <a href="#solutions">Templates</a>
          <a href="#faq">Pricing</a>
        </div>
        <div className="landing-footer__col">
          <strong>Company</strong>
          <a href="#faq">Privacy Policy</a>
          <a href="#faq">Terms of Service</a>
          <a href="#features">About</a>
        </div>
        <div className="landing-footer__col">
          <strong>Connect</strong>
          <a href="#features">Discord</a>
          <a href="#features">LinkedIn</a>
          <a href="#features">X (Twitter)</a>
        </div>
      </div>
    </footer>
  );
}
