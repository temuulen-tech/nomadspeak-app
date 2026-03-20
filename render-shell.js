/**
 * render-shell.js
 * Mounts safe screen/modal shell markup that does not need to stay hardcoded in index.html.
 */

const SHELL_TARGETS = [
  {
    id: "screen-shell-aux",
    html: `
      <!-- Extracted screen shells: stats, profile, and end screens. -->
      <section class="card hidden" id="stats-screen">
        <div class="play-exit-row"><button class="primary play-exit-btn game-exit-btn" type="button">Тоглоомоос гарах</button></div>
        <div class="panel-header">
          <h2 class="screen-title-chip chip-title">Миний ахиц &amp; Амжилт</h2>
        </div>
        <p class="muted">Өдрийн ахиц, 7 хоногийн идэвх болон шагналын явцаа эндээс харна.</p>

        <section class="progress-summary" aria-label="Ахицын товч мэдээлэл">
          <div class="progress-summary-primary">
            <article class="progress-summary-card progress-summary-card-primary"><p class="chip-label progress-summary-label">⭐ Оноо</p><p class="progress-summary-value" id="stats-total-xp">0</p></article>
            <article class="progress-summary-card progress-summary-card-primary"><p class="chip-label progress-summary-label">📈 Миний түвшин</p><p class="progress-summary-value" id="stats-level">Түв.1</p></article>
            <article class="progress-summary-card progress-summary-card-primary"><p class="chip-label progress-summary-label">🔥 Дарааллаж хичээллэсэн өдөр</p><p class="progress-summary-value" id="stats-streak">0 өдөр</p></article>
            <article class="progress-summary-card progress-summary-card-primary"><p class="chip-label progress-summary-label">📅 Өнөөдрийн ахиц</p><p class="progress-summary-value" id="stats-today-progress">0/10</p></article>
          </div>

          <section class="progress-summary-secondary stats-panel control-panel-gold-outline" aria-label="Цагийн товч үзүүлэлт">
            <div class="stats-panel-header progress-summary-secondary-header">
              <h3 class="screen-title-chip chip-title stats-section-chip">Цагийн товч</h3>
              <p class="muted progress-summary-secondary-copy">Сүүлийн идэвхээ нэг дороос тайван хар.</p>
            </div>
            <div class="progress-summary-secondary-grid">
              <article class="progress-summary-card progress-summary-card-secondary"><p class="chip-label progress-summary-label">Өнөөдөр</p><p class="progress-summary-value chip-time" id="stats-today-minutes">00:00:00</p></article>
              <article class="progress-summary-card progress-summary-card-secondary"><p class="chip-label progress-summary-label">Энэ долоо хоног</p><p class="progress-summary-value chip-time" id="stats-this-week-time">00:00:00</p></article>
              <article class="progress-summary-card progress-summary-card-secondary"><p class="chip-label progress-summary-label">Өнгөрсөн долоо хоног</p><p class="progress-summary-value chip-time" id="stats-last-week-time">00:00:00</p></article>
              <article class="progress-summary-card progress-summary-card-secondary"><p class="chip-label progress-summary-label">Энэ сар</p><p class="progress-summary-value chip-time" id="stats-this-month-time">00:00:00</p></article>
            </div>
          </section>
        </section>

        <article class="stats-panel control-panel-gold-outline">
          <div class="stats-panel-header"><h3 class="screen-title-chip chip-title stats-section-chip">Нийт хичээллэсэн цагууд</h3></div>
          <div class="stats-gauge-layout">
            <div class="stats-gauge-main">
              <div class="stats-period-selector" id="stats-period-selector" role="group" aria-label="Хугацаа сонголт">
                <button class="secondary stats-period-btn active" type="button" data-period="day">Өдөр</button>
                <button class="secondary stats-period-btn" type="button" data-period="week">7 хоног</button>
                <button class="secondary stats-period-btn" type="button" data-period="month">Сар</button>
                <button class="secondary stats-period-btn" type="button" data-period="year">Жил</button>
              </div>
              <div class="stats-kpi-block" aria-live="polite">
                <p class="stats-kpi-label chip-label" id="stats-kpi-label">Өнөөдөр</p>
                <p class="stats-kpi-value chip-time" id="stats-kpi-value">00:00:00</p>
                <p class="stats-kpi-meta chip-label">Норм: <strong id="stats-kpi-norm">00:00:00</strong></p>
                <p class="stats-kpi-meta chip-label">Биелэлт: <strong id="stats-kpi-percent">0%</strong></p>
              </div>
            </div>
            <div class="stats-thermometer-wrap" aria-live="polite">
              <p class="stats-thermometer-tier chip-label" id="stats-thermometer-tier">Түвшин: Муу</p>
              <div class="stats-thermometer-labels">
                <span class="chip-label">Онц сайн</span>
                <span class="chip-label">Сайн</span>
                <span class="chip-label">Хэвийн</span>
                <span class="chip-label">Дунд</span>
                <span class="chip-label">Муу</span>
              </div>
              <div class="stats-thermometer" aria-hidden="true">
                <div class="stats-thermometer-fill" id="stats-thermometer-fill"></div>
                <div class="stats-thermometer-marker" id="stats-thermometer-marker"></div>
              </div>
            </div>
          </div>
        </article>

        <article class="stats-panel control-panel-gold-outline">
          <div class="stats-panel-header"><h3 class="screen-title-chip chip-title stats-section-chip">Сүүлийн 7 хоног</h3></div>
          <ul class="stats-time-list" id="stats-last-7-days"></ul>
        </article>

        <article class="stats-panel control-panel-gold-outline">
          <div class="stats-panel-header stats-reward-header">
            <h3 class="screen-title-chip chip-title stats-section-chip">Авсан шагналууд</h3>
            <div class="stats-reward-header-controls">
              <div class="stats-reward-tabs" id="stats-reward-tabs" role="tablist" aria-label="Шагналын төрлүүд">
                <button class="stats-reward-tab active" type="button" role="tab" aria-selected="true" data-reward-tab="days">Өдрүүд</button>
                <button class="stats-reward-tab" type="button" role="tab" aria-selected="false" data-reward-tab="weeks">7 хоногууд</button>
                <button class="stats-reward-tab" type="button" role="tab" aria-selected="false" data-reward-tab="months">Сарууд</button>
                <button class="stats-reward-tab" type="button" role="tab" aria-selected="false" data-reward-tab="years">Жилүүд</button>
              </div>
            </div>
          </div>
          <div class="stats-reward-cards" id="stats-reward-cards" aria-live="polite"></div>
        </article>
      </section>

      <section class="card hidden" id="profile-screen">
        <div class="play-exit-row"><button class="primary play-exit-btn game-exit-btn" type="button">Тоглоомоос гарах</button></div>
        <div class="panel-header">
          <h2 class="screen-title-chip chip-title">👤 Профайл</h2>
          <div class="time-widget"><button class="secondary time-details-btn" type="button">Бүх хугацаагаа харах</button></div>
          <button class="secondary sound-toggle-btn" type="button" aria-pressed="true">🔊 Дуу: АСААЛТТАЙ</button>
        </div>

        <div class="profile-grid">
          <article class="profile-card">
            <h3 class="chip-label">Ахиц</h3>
            <label class="profile-label chip-label" for="profile-name-input">Хоч нэр</label>
            <input class="profile-input" id="profile-name-input" type="text" maxlength="24" placeholder="Нэрээ оруулна уу" />
            <p class="muted" id="profile-name-saved">Хадгалагдсан нэр: —</p>
            <ul class="profile-progress-list">
              <li>⭐ Нийт туршлага: <strong id="profile-total-xp">0</strong></li>
              <li>📈 Түвшин: <strong id="profile-level">1</strong></li>
              <li>🔥 Цуврал: <strong id="profile-streak-days">0 өдөр</strong></li>
              <li>📅 Өнөөдөр: <strong id="profile-daily-progress">0/10 туршлага</strong></li>
              <li>🎁 Шагналын шат: <strong id="profile-reward-stage">⭐ Таван хошуу</strong></li>
            </ul>
          </article>

          <article class="profile-card premium-card">
            <h3 class="chip-label">Дээд багц</h3>
            <p class="muted" id="profile-plan-status">Төлөв: Үнэгүй</p>
            <div class="premium-features">
              <div>
                <h4 class="chip-label">Үнэгүй</h4>
                <ul><li>Өдөрт 10 туршлага хүртэл (Өгүүлбэрийн тоглоом)</li><li>Үндсэн хичээл, статистик</li></ul>
              </div>
              <div>
                <h4 class="chip-label">Дээд багц</h4>
                <ul><li>Хязгааргүй Өгүүлбэрийн тоглоом</li><li>Ирээдүйн дээд багцын контент</li></ul>
              </div>
            </div>
            <p class="premium-pricing">Сард: 9,900₮</p>
            <p class="premium-pricing">Жилээр: 89,000₮</p>
            <button class="primary" id="upgrade-premium-btn" type="button">Дээд багц-д шилжих</button>
          </article>
        </div>
      </section>

      <section class="card hidden" id="end-screen">
        <div class="play-exit-row"><button class="primary play-exit-btn game-exit-btn" type="button">Тоглоомоос гарах</button></div>
        <div class="panel-header">
          <h2 class="screen-title-chip chip-title">Дууслаа 🎉</h2>
          <div class="time-widget">
            <div class="today-time chip-time">Өнөөдрийн хугацаа: <span id="today-time-end">00:00:00</span></div>
            <button class="secondary time-details-btn" type="button">Бүх хугацаагаа харах</button>
          </div>
          <button class="secondary sound-toggle-btn" type="button" aria-pressed="true">🔊 Дуу: АСААЛТТАЙ</button>
        </div>
        <p class="muted" id="final-text">Таны оноо: 0</p>

        <div class="end-actions">
          <button class="primary" id="restart-btn">Дахин эхлэх</button>
        </div>
      </section>
    `,
  },
  {
    id: "overlay-shell",
    html: `
      <!-- Extracted overlay layer: shared dialogs and install hint. -->
      <div class="confirm-overlay hidden" id="premium-overlay" role="dialog" aria-modal="true" aria-labelledby="premium-title">
        <div class="confirm-card">
          <h2 id="premium-title" class="chip-title">Дээд багц</h2>
          <p class="muted" id="premium-message">Төлбөрийн хэсэг удахгүй нээгдэнэ</p>
          <div class="confirm-actions"><button class="primary" id="premium-ok-btn" type="button">Ойлголоо</button></div>
        </div>
      </div>

      <div class="confirm-overlay hidden" id="qa-modal" role="dialog" aria-modal="true" aria-labelledby="qa-modal-title">
        <div class="confirm-card qa-modal-card">
          <h2 id="qa-modal-title" class="chip-title">Мэдээлэл</h2>
          <div class="muted" id="qa-modal-body"></div>
          <div class="confirm-actions"><button class="primary" id="qa-modal-close-btn" type="button">Хаах</button></div>
        </div>
      </div>

      <div class="confirm-overlay hidden" id="vault-modal" role="dialog" aria-modal="true" aria-labelledby="vault-modal-title">
        <div class="confirm-card qa-modal-card vault-modal">
          <header class="vault-header"><h2 id="vault-modal-title" class="chip-title">Хичээлийн хадгалсан асуултууд</h2></header>
          <div class="muted vault-body" id="vault-modal-body"></div>
          <footer class="vault-footer" id="vault-modal-footer">
            <p class="vault-motivation chip-label">Чиний дэлхийг тойрох урт холын аялалд Амжилт хүсье. Найзаа</p>
            <div class="vault-actions vault-footer-buttons">
              <button class="secondary" id="vault-replay-btn" type="button">Дахин давтах</button>
              <button class="secondary" id="vault-delete-btn" type="button" title="Зөвхөн хадгалсан жагсаалтаас хасна">Хадгалсанаас устгах</button>
              <button class="secondary" id="vault-learned-btn" type="button">Сурсан</button>
              <button class="primary" id="vault-modal-close-btn" type="button">Хаах</button>
            </div>
          </footer>
        </div>
      </div>

      <div class="confirm-overlay hidden" id="time-details-modal" role="dialog" aria-modal="true" aria-labelledby="time-details-title">
        <div class="confirm-card qa-modal-card time-details-modal-card">
          <h2 id="time-details-title" class="chip-title">Бүх хугацааны мэдээлэл</h2>
          <div class="time-details-list" id="time-details-list">
            <p class="chip-label">Өчигдөрийн хугацаа: <strong class="chip-time" id="time-details-yesterday">00:00:00</strong></p>
            <p class="chip-label">Энэ долоо хоногийн хугацаа: <strong class="chip-time" id="time-details-this-week">00:00:00</strong></p>
            <p class="chip-label">Өнгөрсөн долоо хоногийн хугацаа: <strong class="chip-time" id="time-details-last-week">00:00:00</strong></p>
            <p class="chip-label">Энэ сарын хугацаа: <strong class="chip-time" id="time-details-this-month">00:00:00</strong></p>
            <p class="chip-label">Өнгөрсөн сарын хугацаа: <strong class="chip-time" id="time-details-last-month">00:00:00</strong></p>
          </div>
          <div class="confirm-actions"><button class="primary" id="time-details-close-btn" type="button">Хаах</button></div>
        </div>
      </div>

      <div class="install-hint hidden" id="install-hint" role="status" aria-live="polite">
        <span>📲 Энэ аппыг утсан дээрээ суулгаад оффлайн үед ч ашиглаарай.</span>
        <button class="primary" id="install-btn" type="button">Апп суулгах</button>
      </div>
    `,
  },
];

export function mountAppShell() {
  SHELL_TARGETS.forEach(({ id, html }) => {
    const mountPoint = document.getElementById(id);
    if (!mountPoint || mountPoint.dataset.shellMounted === "true") return;
    mountPoint.innerHTML = html.trim();
    mountPoint.dataset.shellMounted = "true";
  });
}
