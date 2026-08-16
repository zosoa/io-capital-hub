import Link from "next/link";
import type { Metadata } from "next";
import "./landing.css";
import LandingFx from "./LandingFx";

export const metadata: Metadata = {
  title: "Capital Hub — CEO Summit IO · Financement privé de l'Océan Indien",
  description:
    "Mise en relation directe entre projets bancables et investisseurs de l'Océan Indien. Capital Hub centralise les opportunités qualifiées pour les fonds, family offices et banques de la région, en toute confidentialité.",
};

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

export default function LandingPage() {
  return (
    <div className="lp">

      {/* NAV */}
      <nav id="lpnav">
        <div className="wrap nav-in">
          <Link href="/" className="brand">
            <img src="/landing/ceo-logo.png" alt="CEO Summit" />
            <span className="txt">
              <b>CEO Summit IO</b>
              <span>Investment Hub</span>
            </span>
          </Link>
          <div className="nav-links">
            <a href="#secteurs">Lever des fonds</a>
            <a href="#investisseurs">Investisseurs &amp; Banques</a>
            <a href="#reseau">Le réseau</a>
          </div>
          <div className="nav-cta">
            <Link href="/auth/login" className="login">Se connecter</Link>
            <Link href="/eligibilite" className="btn btn-forest">Déposer un projet</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-sdg" />
        <div className="wrap hero-grid">
          <div>
            <span className="kicker rv">1ʳᵉ plateforme de financement — Océan Indien</span>
            <h1 className="serif rv">
              Mise en relation directe entre projets bancables et investisseurs de l&apos;<span>Océan Indien</span>.
            </h1>
            <p className="lead rv">
              Capital Hub centralise les opportunités d&apos;investissement qualifiées et les présente en toute
              confidentialité aux fonds, family offices et banques de la région.
            </p>
            <div className="hero-cta rv">
              <Link href="/eligibilite" className="btn btn-forest">Je cherche des financements <Arrow /></Link>
              <a href="#investisseurs" className="btn btn-soft">Je suis investisseur <Arrow /></a>
            </div>
            <p className="hero-paths rv">
              Porteurs&nbsp;: déposez en toute confidentialité · Investisseurs&nbsp;: enregistrez votre mandat
            </p>
            <ul className="hero-checks rv">
              <li><Tick /><span>Vérification rapide de votre dossier sous <strong>72&nbsp;h</strong></span></li>
              <li><Tick /><span>Diffusé uniquement aux <strong>institutions &amp; investisseurs qualifiés</strong></span></li>
            </ul>
            <div className="hero-metrics rv">
              <div className="metric"><div className="n"><span data-count="25">0</span>k–<span data-count="50">0</span>M&nbsp;$</div><div className="l">Fourchette de tickets</div></div>
              <div className="metric"><div className="n"><span data-count="8">0</span></div><div className="l">Secteurs financés</div></div>
              <div className="metric"><div className="n">Privé</div><div className="l">Confidentialité stricte</div></div>
            </div>
          </div>

          {/* Orbiting stage */}
          <div className="stage rv">
            <div className="orbit">
              <div className="node n1" title="Énergie & Transition"><div className="chip"><img src="/landing/ico-solar.png" alt="Énergie" /></div></div>
              <div className="node n2" title="Agro et Industriel"><div className="chip"><img src="/landing/ico-tractor.png" alt="Agro et Industriel" /></div></div>
              <div className="node n3" title="Tech & Fintech"><div className="chip"><img src="/landing/ico-monitor.png" alt="Tech & Fintech" /></div></div>
              <div className="node n4" title="Tourisme & Hôtellerie"><div className="chip"><img src="/landing/ico-tourism.png" alt="Tourisme" /></div></div>
              <div className="node n5" title="Infrastructure & Logistique"><div className="chip"><img src="/landing/ico-construction.png" alt="Infrastructure" /></div></div>
              <div className="node n6" title="Économie bleue"><div className="chip"><img src="/landing/ico-ship.png" alt="Économie bleue" /></div></div>
              <div className="node n7" title="Mines & Ressources"><div className="chip"><img src="/landing/ico-mines.png" alt="Mines" /></div></div>
              <div className="node n8" title="Savoir & Éducation"><div className="chip"><img src="/landing/ico-book.png" alt="Savoir" /></div></div>
            </div>
            <div className="figure">
              <img src="/landing/entrepreneur.png" alt="Porteur de projet" />
            </div>
            <span className="hero-tag">8 secteurs financés</span>
          </div>
        </div>
      </header>

      {/* TRUST */}
      <section className="trust" id="reseau">
        <p className="lbl rv">Soutenu par l&apos;écosystème du CEO Summit Indian Ocean</p>
        <div className="marquee rv">
          <div className="marquee-track">
            <img src="/landing/logo-union-europeenne.png" alt="Union Européenne" />
            <img src="/landing/logo-undp.png" alt="UNDP" />
            <img src="/landing/logo-sadc.png" alt="SADC" />
            <img src="/landing/logo-mauritius-finance.png" alt="Mauritius Finance" />
            <img src="/landing/logo-afd.png" alt="AFD" />
            <img src="/landing/logo-edbm.png" alt="EDBM" />
            <img src="/landing/logo-mef.png" alt="MEF" />
            <img src="/landing/logo-union-europeenne.png" alt="" />
            <img src="/landing/logo-undp.png" alt="" />
            <img src="/landing/logo-sadc.png" alt="" />
            <img src="/landing/logo-mauritius-finance.png" alt="" />
            <img src="/landing/logo-afd.png" alt="" />
            <img src="/landing/logo-edbm.png" alt="" />
            <img src="/landing/logo-mef.png" alt="" />
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="block" id="secteurs">
        <div className="wrap">
          <div className="head rv">
            <span className="idx">Secteurs</span>
            <h2 className="serif">Secteurs d&apos;intervention &amp; tickets moyens</h2>
            <p>Pour protéger la confidentialité des porteurs, aucun projet n&apos;est publié en libre accès. Voici les secteurs ciblés par nos investisseurs partenaires et les ordres de grandeur financés.</p>
          </div>
          <div className="cards">
            <div className="card c1 rv"><span className="icochip"><img src="/landing/ico-solar.png" alt="" /></span><h3>Énergie &amp; Transition</h3><p>Solaire, hydro, transition énergétique et réseaux.</p><div className="tk">500k – 10M&nbsp;$</div></div>
            <div className="card c2 rv"><span className="icochip"><img src="/landing/ico-tractor.png" alt="" /></span><h3>Agro et Industriel</h3><p>Production, transformation et chaînes de valeur.</p><div className="tk">100k – 5M&nbsp;$</div></div>
            <div className="card c3 rv"><span className="icochip"><img src="/landing/ico-monitor.png" alt="" /></span><h3>Tech &amp; Fintech</h3><p>SaaS, fintech, plateformes et scale-ups.</p><div className="tk">25k – 2M&nbsp;$</div></div>
            <div className="card c4 rv"><span className="icochip"><img src="/landing/ico-tourism.png" alt="" /></span><h3>Tourisme &amp; Hôtellerie</h3><p>Éco-tourisme, hôtellerie et patrimoine.</p><div className="tk">250k – 8M&nbsp;$</div></div>
            <div className="card c5 rv"><span className="icochip"><img src="/landing/ico-construction.png" alt="" /></span><h3>Infrastructure &amp; Logistique</h3><p>Ports, routes, entrepôts et chaînes logistiques.</p><div className="tk">1M – 25M&nbsp;$</div></div>
            <div className="card c6 rv"><span className="icochip"><img src="/landing/ico-ship.png" alt="" /></span><h3>Économie bleue</h3><p>Pêche durable, aquaculture et maritime.</p><div className="tk">200k – 6M&nbsp;$</div></div>
            <div className="card c7 rv"><span className="icochip"><img src="/landing/ico-mines.png" alt="" /></span><h3>Mines &amp; Ressources</h3><p>Extraction responsable et valorisation locale.</p><div className="tk">2M – 50M&nbsp;$</div></div>
            <div className="card c8 rv"><span className="icochip"><img src="/landing/ico-book.png" alt="" /></span><h3>Savoir &amp; Éducation</h3><p>Edtech, formation et enseignement supérieur.</p><div className="tk">50k – 3M&nbsp;$</div></div>
          </div>
        </div>
      </section>

      {/* INVESTORS */}
      <section className="block investor-block" id="investisseurs">
        <div className="wrap">
          <div className="head rv">
            <span className="idx">Espace investisseurs</span>
            <h2 className="serif">Un deal-flow qualifié, filtré selon vos critères.</h2>
            <p>Accédez à des dossiers structurés à travers l&apos;Océan Indien et l&apos;Afrique. Recevez uniquement les opportunités qui correspondent à votre thèse d&apos;investissement (secteur, géographie, ticket, instrument).</p>
          </div>

          <div className="device rv">
            <div className="device-bar"><span /><span /><span /><div className="device-url">capital-hub.io · deal-flow</div></div>
            <div className="mandate-demo">
            <div className="mandate-panel">
              <div className="mp-head"><span className="dot" /> Votre mandat</div>
              <div className="mp-field"><span className="mp-lbl">Géographie</span><div className="chips"><span className="chip on">Océan Indien</span><span className="chip on">Afrique de l&apos;Est</span><span className="chip">Afrique australe</span></div></div>
              <div className="mp-field"><span className="mp-lbl">Secteurs</span><div className="chips"><span className="chip on">Énergie</span><span className="chip on">Infrastructure</span><span className="chip">Tourisme</span></div></div>
              <div className="mp-field"><span className="mp-lbl">Ticket</span><div className="range"><span>2&nbsp;M$</span><div className="track"><i /></div><span>25&nbsp;M$</span></div></div>
              <div className="mp-field"><span className="mp-lbl">Instrument</span><div className="chips"><span className="chip on">Equity</span><span className="chip on">Dette</span><span className="chip">Project finance</span></div></div>
            </div>
            <div className="feed-panel">
              <div className="fp-head"><strong>6 opportunités</strong> correspondent à votre mandat</div>
              <div className="deal"><span className="d-no">01</span><div className="d-body"><div className="d-title">Plateforme énergies renouvelables</div><div className="d-meta">Kenya · 8&nbsp;M$ · Growth equity</div></div><span className="d-match">96&nbsp;%</span></div>
              <div className="deal"><span className="d-no">02</span><div className="d-body"><div className="d-title">Expansion hôtelière côtière</div><div className="d-meta">Maurice · 12&nbsp;M$ · Dette structurée</div></div><span className="d-match">91&nbsp;%</span></div>
              <div className="deal"><span className="d-no">03</span><div className="d-body"><div className="d-title">Infrastructure logistique portuaire</div><div className="d-meta">Madagascar · 25&nbsp;M$ · Project finance</div></div><span className="d-match">88&nbsp;%</span></div>
              <div className="fp-foot">Exemple illustratif — ni offre ni sollicitation d&apos;investissement.</div>
            </div>
            </div>
          </div>

          <div className="inv-flow rv">
            <div className="ifs"><div className="ifn">01</div><h4>Enregistrez</h4><p>Créez votre profil et définissez votre mandat d&apos;investissement.</p></div>
            <div className="ifs"><div className="ifn">02</div><h4>Matching</h4><p>Notre équipe identifie les opportunités qui correspondent à vos critères.</p></div>
            <div className="ifs"><div className="ifn">03</div><h4>Revue</h4><p>Recevez l&apos;essentiel pour juger si une opportunité mérite un examen approfondi.</p></div>
            <div className="ifs"><div className="ifn">04</div><h4>Accès</h4><p>Choisissez les dossiers à explorer. Data room sous NDA géré numériquement.</p></div>
            <div className="ifs"><div className="ifn">05</div><h4>Engagement</h4><p>Nous facilitons la mise en relation avec le porteur et les parties professionnelles.</p></div>
          </div>

          <div className="inv-why rv">
            <div className="iw"><h3>Flux qualifié, sans bruit</h3><p>Pas de marketplace publique ni d&apos;annonces anonymes. Uniquement des opportunités auditées.</p></div>
            <div className="iw"><h3>Analyse &amp; filtre humain</h3><p>La technologie filtre les critères ; nos équipes valident la pertinence et la viabilité avant présentation.</p></div>
            <div className="iw"><h3>Confidentialité stricte</h3><p>Rien n&apos;est public. Vos données financières ne sont partagées qu&apos;après votre accord et sous NDA.</p></div>
          </div>

          <div className="investor-types-bar rv">
            <div className="inv-type">Fonds de Private Equity &amp; VC</div>
            <div className="inv-type">Family offices &amp; HNWI</div>
            <div className="inv-type">Institutions financières de développement</div>
            <div className="inv-type">Banques &amp; établissements de crédit</div>
          </div>

          <div className="inv-cta-box rv">
            <div>
              <h3 className="serif">Vous cherchez à déployer du capital dans la région&nbsp;?</h3>
              <p>Rejoignez le réseau d&apos;investisseurs du CEO Summit Indian Ocean.</p>
            </div>
            <Link href="/auth/signup?intent=investor" className="btn btn-terra">Demander un accès investisseur <Arrow /></Link>
          </div>
        </div>
      </section>

      {/* METHOD */}
      <section className="block" id="methode" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="founder rv">
            <span className="idx">La méthode</span>
            <blockquote className="serif" style={{ marginTop: 14 }}>
              « Lors du sommet, nous avons réalisé que des investisseurs actifs et des porteurs de projets à fort potentiel étaient{" "}
              <span>dans la même pièce sans se trouver</span>. Capital Hub a été créé pour combler ce vide, de manière structurée et discrète. »
            </blockquote>
            <div className="sig">
              <img className="sig-av" src="/landing/founder-avatar.jpg" alt="Zosoa Rasoarahona" />
              <div>
                <div className="nm serif">Zosoa Rasoarahona</div>
                <div className="rl">Head of Capital &amp; Finance · CEO Summit IO</div>
              </div>
            </div>
          </div>
          <div className="steps">
            <div className="step rv"><div className="no"><svg viewBox="0 0 24 24" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3"/></svg></div><h4 className="serif">Vous déposez</h4><p>Un dossier structuré, en quelques minutes. Privé — jamais listé, jamais public.</p></div>
            <div className="step rv"><div className="no"><svg viewBox="0 0 24 24" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/></svg></div><h4 className="serif">Nous qualifions</h4><p>Une équipe humaine — pas un algorithme — confronte votre projet aux mandats actifs du réseau.</p></div>
            <div className="step rv"><div className="no"><svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 20v-1a4 4 0 014-4h4a4 4 0 014 4v1M17 4.2a3 3 0 010 5.6M21 20v-1a4 4 0 00-3-3.8"/></svg></div><h4 className="serif">Nous introduisons</h4><p>Une mise en relation directe avec les investisseurs dont le mandat correspond. Vous gardez le contrôle.</p></div>
          </div>
        </div>
      </section>

      {/* CONFIDENTIAL */}
      <div className="wrap">
        <section className="confid rv">
          
          <span className="eb">Confidentialité</span>
          <h2 className="serif">Aucun projet n&apos;est publié. Rien ne circule sans votre accord.</h2>
          <p>Vos données financières et vos projections ne sont partagées qu&apos;avec les investisseurs que vous approuvez, et uniquement après votre accord explicite, sous NDA.</p>
        </section>
      </div>

      {/* FINAL */}
      <section className="final">
        <div className="wrap">
          
          <h2 className="serif rv">Présentez votre projet aux <span>investisseurs du réseau</span>.</h2>
          <p className="rv">Accédez à notre réseau de financement privé au sein du CEO Summit Indian Ocean.</p>
          <div className="duo rv">
            <Link href="/eligibilite" className="btn btn-terra">Déposer mon projet <Arrow /></Link>
            <Link href="/auth/signup?intent=investor" className="btn btn-line">Je suis investisseur</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="about">
              <Link href="/" className="brand">
                <img src="/landing/ceo-logo.png" alt="CEO Summit" />
                <span className="txt"><b>CEO Summit IO</b><span>Investment Hub</span></span>
              </Link>
              <p>La plateforme de financement privée du CEO Summit Indian Ocean. Nous connectons les porteurs de projets aux investisseurs actifs de la région, en toute confidentialité.</p>
              <a href="mailto:capital@ceo-summit.mg" className="foot-mail">capital@ceo-summit.mg</a>
            </div>
            <div className="foot-col">
              <h5>Plateforme</h5>
              <Link href="/eligibilite">Déposer un dossier</Link>
              <a href="#methode">La méthode</a>
              <a href="#secteurs">Secteurs</a>
              <Link href="/auth/login">Se connecter</Link>
            </div>
            <div className="foot-col">
              <h5>CEO Summit Indian Ocean</h5>
              <a href="#">Antananarivo, Madagascar</a>
              <a href="https://www.ceo-summit.mg" target="_blank" rel="noopener noreferrer">www.ceo-summit.mg</a>
            </div>
          </div>
          <div className="foot-affil">
            <div className="a"><span className="l">Affilié à</span><img src="/landing/logo-becom.png" alt="Becom" /> Becom</div>
            <div className="a"><span className="l">Propulsé par</span> Gelios Investment &amp; Partners Ltd</div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 CEO Summit IO · Cluster Capital &amp; Finance. Tous droits réservés.</span>
            <span>Confidentialité · Conditions d&apos;utilisation</span>
          </div>
        </div>
      </footer>

      <LandingFx />
    </div>
  );
}
