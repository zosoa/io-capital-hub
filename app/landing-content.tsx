import Link from "next/link";
import LandingFx from "./LandingFx";
import { KapexLogo } from "@/components/ui/logo";
import type { Dict } from "./i18n/landing";

const Arrow = () => (
  <svg className="arw" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
  </svg>
);

const Tick = () => (
  <svg className="tick" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#1E9E5A" />
    <path d="M7.5 12.4l2.7 2.7 6.3-6.6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NB = " ";

// ── Structural data (language-independent) ───────────────────────────────────
const NODE_IMG = [
  "ico-solar", "ico-tractor", "ico-monitor", "ico-tourism",
  "ico-construction", "ico-ship", "ico-mines", "ico-book",
];
const SECTOR_META = [
  { cls: "c1", img: "ico-solar", tk: `500k – 10M${NB}$` },
  { cls: "c2", img: "ico-tractor", tk: `100k – 5M${NB}$` },
  { cls: "c3", img: "ico-monitor", tk: `25k – 2M${NB}$` },
  { cls: "c4", img: "ico-tourism", tk: `250k – 8M${NB}$` },
  { cls: "c5", img: "ico-construction", tk: `1M – 25M${NB}$` },
  { cls: "c6", img: "ico-ship", tk: `200k – 6M${NB}$` },
  { cls: "c7", img: "ico-mines", tk: `2M – 50M${NB}$` },
  { cls: "c8", img: "ico-book", tk: `50k – 3M${NB}$` },
];
const DEAL_META = [
  { no: "01", match: 96 },
  { no: "02", match: 91 },
  { no: "03", match: 88 },
];
const FLOW_ICONS = [
  <><circle cx="10" cy="8" r="3.2" /><path d="M4 20a6 6 0 0112 0M18 8v5M20.5 10.5h-5" /></>,
  <><circle cx="12" cy="12" r="8.2" /><circle cx="12" cy="12" r="3" /><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" /></>,
  <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 14.5l2 2 3.5-4" /></>,
  <><circle cx="8" cy="15" r="3.6" /><path d="M10.6 12.4L20 3M16.5 6.5l2 2M14.5 8.5l1.6 1.6" /></>,
  <><circle cx="8.5" cy="8" r="2.6" /><circle cx="15.5" cy="8" r="2.6" /><path d="M4 19a4.5 4.5 0 019 0M11 19a4.5 4.5 0 019 0" /></>,
];
const STEP_ICONS = [
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />,
  <>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </>,
  <>
    <circle cx="9" cy="8" r="3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20v-1a4 4 0 014-4h4a4 4 0 014 4v1M17 4.2a3 3 0 010 5.6M21 20v-1a4 4 0 00-3-3.8" />
  </>,
];

export default function LandingContent({ t, locale }: { t: Dict; locale: "fr" | "en" }) {
  const home = locale === "en" ? "/en" : "/";
  const pct = (n: number) => (locale === "en" ? `${n}%` : `${n}${NB}%`);

  return (
    <div className="lp">

      {/* NAV */}
      <nav id="lpnav">
        <div className="wrap nav-in">
          <Link href={home} className="brand" aria-label="KAPEX">
            <KapexLogo height={30} variant="dark" />
          </Link>
          <div className="nav-links">
            <a href="#secteurs">{t.nav.raise}</a>
            <a href="#investisseurs">{t.nav.investors}</a>
            <a href="#reseau">{t.nav.network}</a>
          </div>
          <div className="nav-cta">
            <div className="lang-switch" aria-label="Language">
              <Link href="/" className={locale === "fr" ? "on" : ""} hrefLang="fr">FR</Link>
              <Link href="/en" className={locale === "en" ? "on" : ""} hrefLang="en">EN</Link>
            </div>
            <Link href="/auth/login" className="login">{t.nav.login}</Link>
            <Link href="/eligibilite" className="btn btn-forest">{t.nav.deposit}</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-sdg" />
        <div className="wrap hero-grid">
          <div>
            <span className="kicker rv">{t.hero.kicker}</span>
            <h1 className="serif rv">
              {t.hero.titlePre}<span>{t.hero.titleHi}</span>{t.hero.titlePost}
            </h1>
            <p className="lead rv">{t.hero.lead}</p>
            <div className="hero-cta rv">
              <Link href="/eligibilite" className="btn btn-forest">{t.hero.ctaRaise} <Arrow /></Link>
              <a href="#investisseurs" className="btn btn-soft">{t.hero.ctaInvestor} <Arrow /></a>
            </div>
            <p className="hero-paths rv">{t.hero.paths}</p>
            <ul className="hero-checks rv">
              <li><Tick /><span>{t.hero.check1.pre}<strong>{t.hero.check1.strong}</strong>{t.hero.check1.post}</span></li>
              <li><Tick /><span>{t.hero.check2.pre}<strong>{t.hero.check2.strong}</strong>{t.hero.check2.post}</span></li>
            </ul>
            <div className="hero-metrics rv">
              <div className="metric"><div className="n"><span data-count="25">0</span>k–<span data-count="50">0</span>M{NB}$</div><div className="l">{t.hero.metricTicket}</div></div>
              <div className="metric"><div className="n"><span data-count="8">0</span></div><div className="l">{t.hero.metricSectors}</div></div>
              <div className="metric"><div className="n">{t.hero.metricPrivateN}</div><div className="l">{t.hero.metricPrivateL}</div></div>
            </div>
          </div>

          {/* Orbiting stage */}
          <div className="stage rv">
            <div className="orbit">
              {NODE_IMG.map((img, i) => (
                <div key={i} className={`node n${i + 1}`} title={t.nodes[i]}>
                  <div className="chip"><img src={`/landing/${img}.png`} alt={t.nodes[i]} /></div>
                </div>
              ))}
            </div>
            <div className="figure">
              <img src="/landing/entrepreneur.png" alt={t.hero.figureAlt} />
            </div>
            <a href="#secteurs" className="hero-tag">{t.hero.tag}</a>
          </div>
        </div>
      </header>

      {/* RESOLUTION — parent endorsement */}
      <section className="resolution rv">
        <div className="wrap res-in">
          <span className="res-label">{t.resolution.label}</span>
          <img className="res-logo" src="/landing/ceo-logo.png" alt="CEO Summit Indian Ocean" />
        </div>
      </section>

      {/* TRUST */}
      <section className="trust" id="reseau">
        <p className="lbl rv">{t.trust.label}</p>
        <div className="marquee rv">
          <div className="marquee-track">
            {["logo-union-europeenne", "logo-undp", "logo-sadc", "logo-mauritius-finance", "logo-afd", "logo-edbm", "logo-mef"].concat(
              ["logo-union-europeenne", "logo-undp", "logo-sadc", "logo-mauritius-finance", "logo-afd", "logo-edbm", "logo-mef"]
            ).map((logo, i) => (
              <img key={i} src={`/landing/${logo}.png`} alt={i < 7 ? logo.replace("logo-", "").replace(/-/g, " ") : ""} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="block" id="secteurs">
        <div className="wrap">
          <div className="head rv">
            <span className="idx">{t.sectors.idx}</span>
            <h2 className="serif">{t.sectors.title}</h2>
            <p>{t.sectors.desc}</p>
          </div>
          <div className="cards">
            {SECTOR_META.map((s, i) => (
              <div key={i} className={`card ${s.cls} rv`}>
                <span className="icochip"><img src={`/landing/${s.img}.png`} alt="" /></span>
                <h3>{t.sectors.cards[i].title}</h3>
                <p>{t.sectors.cards[i].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INVESTORS */}
      <section className="block investor-block" id="investisseurs">
        <div className="wrap">
          <div className="head rv">
            <span className="idx">{t.investors.idx}</span>
            <h2 className="serif">{t.investors.title}</h2>
            <p>{t.investors.desc}</p>
          </div>

          <div className="device rv">
            <div className="device-bar"><span /><span /><span /><div className="device-url">kapex.io · deal-flow</div></div>
            <div className="mandate-demo">
              <div className="mandate-panel">
                <div className="mp-head"><span className="dot" /> {t.investors.mandateTitle}</div>
                <div className="mp-field"><span className="mp-lbl">{t.investors.fGeo}</span><div className="chips"><span className="chip on">{t.investors.geoChips[0]}</span><span className="chip on">{t.investors.geoChips[1]}</span><span className="chip">{t.investors.geoChips[2]}</span></div></div>
                <div className="mp-field"><span className="mp-lbl">{t.investors.fSectors}</span><div className="chips"><span className="chip on">{t.investors.sectorChips[0]}</span><span className="chip on">{t.investors.sectorChips[1]}</span><span className="chip">{t.investors.sectorChips[2]}</span></div></div>
                <div className="mp-field"><span className="mp-lbl">{t.investors.fTicket}</span><div className="range"><span>2{NB}M$</span><div className="track"><i /></div><span>25{NB}M$</span></div></div>
                <div className="mp-field"><span className="mp-lbl">{t.investors.fInstrument}</span><div className="chips"><span className="chip on">{t.investors.instrumentChips[0]}</span><span className="chip on">{t.investors.instrumentChips[1]}</span><span className="chip">{t.investors.instrumentChips[2]}</span></div></div>
              </div>
              <div className="feed-panel">
                <div className="fp-head"><strong>{t.investors.feedStrong}</strong>{t.investors.feedRest}</div>
                {DEAL_META.map((d, i) => (
                  <div key={i} className="deal">
                    <span className="d-no">{d.no}</span>
                    <div className="d-body"><div className="d-title">{t.investors.deals[i].title}</div><div className="d-meta">{t.investors.deals[i].meta}</div></div>
                    <span className="d-match">{pct(d.match)}</span>
                  </div>
                ))}
                <div className="fp-foot">{t.investors.feedFoot}</div>
              </div>
            </div>
          </div>

          <div className="inv-flow rv">
            {FLOW_ICONS.map((icon, i) => (
              <div key={i} className={`ifs sc${i + 1}`}>
                <div className="ifs-inner">
                  <div className="ifs-face ifs-front">
                    <span className="fico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{icon}</svg></span>
                    <h4>{t.investors.flow[i].title}</h4>
                    <span className="flip-hint">{t.investors.flipHint}</span>
                  </div>
                  <div className="ifs-face ifs-back"><p>{t.investors.flow[i].desc}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="inv-why rv">
            {t.investors.why.map((w, i) => (
              <div key={i} className="iw"><h3>{w.title}</h3><p>{w.desc}</p></div>
            ))}
          </div>

          <div className="investor-types-bar rv">
            {t.investors.types.map((ty, i) => (
              <div key={i} className="inv-type">{ty}</div>
            ))}
          </div>

          <div className="inv-cta-box rv">
            <div>
              <h3 className="serif">{t.investors.ctaTitle}</h3>
              <p>{t.investors.ctaText}</p>
            </div>
            <Link href="/auth/signup?intent=investor" className="btn btn-terra">{t.investors.ctaBtn} <Arrow /></Link>
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section className="block" id="methode" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="founder rv">
            <span className="idx">{t.method.idx}</span>
            <blockquote className="serif" style={{ marginTop: 14 }}>
              {t.method.quotePre}<span>{t.method.quoteHi}</span>{t.method.quotePost}
            </blockquote>
            <div className="sig">
              <img className="sig-av" src="/landing/founder-avatar.jpg" alt={t.method.sigName} />
              <div className="sig-txt">
                <div className="nm serif">{t.method.sigName}</div>
                <div className="rl">{t.method.sigRole}</div>
              </div>
              <img className="sig-ceo" src="/landing/ceo-logo.png" alt="CEO Summit IO" />
            </div>
          </div>
          <div className="steps">
            {STEP_ICONS.map((icon, i) => (
              <div key={i} className="step rv">
                <div className="no"><svg viewBox="0 0 24 24" fill="none">{icon}</svg></div>
                <h4 className="serif">{t.method.steps[i].title}</h4>
                <p>{t.method.steps[i].desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONFIDENTIAL — navy card textured with the rig blueprint */}
      <div className="wrap">
        <section className="confid rv">
          <img className="confid-bg" src="/landing/auth-rig.jpg" alt="" aria-hidden="true" />
          <span className="eb">{t.confid.eb}</span>
          <h2 className="serif">{t.confid.title}</h2>
          <p>{t.confid.text}</p>
        </section>
      </div>

      {/* FINAL — entrepreneur backdrop */}
      <section className="final">
        <img className="final-bg" src="/landing/auth-hero.jpg" alt="" aria-hidden="true" />
        <div className="wrap final-inner">
          <h2 className="serif rv">{t.final.titlePre}<span>{t.final.titleHi}</span>{t.final.titlePost}</h2>
          <p className="rv">{t.final.text}</p>
          <div className="duo rv">
            <Link href="/eligibilite" className="btn btn-terra">{t.final.btnDeposit} <Arrow /></Link>
            <Link href="/auth/signup?intent=investor" className="btn btn-line">{t.final.btnInvestor}</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="about">
              <Link href={home} className="brand" aria-label="KAPEX">
                <KapexLogo height={32} variant="dark" />
              </Link>
              <p>{t.footer.about}</p>
              <p className="foot-initiative">{t.footer.initiative}</p>
              <a href="mailto:capital@ceo-summit.mg" className="foot-mail">capital@ceo-summit.mg</a>
            </div>
            <div className="foot-col">
              <h5>{t.footer.colPortal}</h5>
              <Link href="/eligibilite">{t.footer.fDeposit}</Link>
              <a href="#methode">{t.footer.fMethod}</a>
              <a href="#secteurs">{t.footer.fSectors}</a>
              <Link href="/auth/login">{t.footer.fLogin}</Link>
            </div>
            <div className="foot-col">
              <h5>CEO Summit Indian Ocean</h5>
              <a href="#">{t.footer.location}</a>
              <a href="https://www.ceo-summit.mg" target="_blank" rel="noopener noreferrer">www.ceo-summit.mg</a>
            </div>
          </div>
          <div className="foot-affil">
            <div className="a"><span className="l">{t.footer.affilTo}</span><img src="/landing/logo-becom.png" alt="Becom" /> Becom</div>
            <div className="a"><span className="l">{t.footer.poweredBy}</span> Gelios Investment &amp; Partners Ltd</div>
          </div>
          <div className="foot-bottom">
            <span>{t.footer.rights}</span>
            <span>{t.footer.legal}</span>
          </div>
        </div>
      </footer>

      <LandingFx />
    </div>
  );
}
