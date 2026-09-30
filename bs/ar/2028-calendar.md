---
layout: default
title: 2028 Bible Reading Calendar
---

<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <p class="card-en mb-2 text-xs font-bold uppercase tracking-widest text-indigo-500">Test Site</p>
    <p class="card-zh mb-2 text-xs font-bold uppercase tracking-widest text-indigo-500">測試網站</p>
    <h1 class="card-en" style="font-size:1.875rem;">2028 Bible Reading Calendar</h1>
    <h1 class="card-zh" style="font-size:1.875rem;">2028 讀經月曆</h1>
    <p id="calendarStatus" class="mt-2 text-sm text-slate-500">Loading 2028 calendar data...</p>
  </div>
  <a href="{{ '/bs/ar/' | relative_url }}" class="inline-flex items-center gap-1 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"><span class="card-en">← Plan Hub</span><span class="card-zh">← 計劃總覽</span></a>
</div>

<div class="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-5 text-sm leading-relaxed text-slate-700">
  <p class="card-en mb-0">This test calendar loads the 2028 date-to-unit map, resolves each stable unit ID to its existing reading code, and then uses the same study-question content as production.</p>
  <p class="card-zh mb-0">此測試月曆載入 2028 日期到單元的對應表，將穩定單元 ID 解析為既有讀經代碼，並使用與正式網站相同的學習問題內容。</p>
</div>

<div class="mb-5 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
  <button id="previousMonth" type="button" class="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Previous month">←</button>
  <div class="text-center">
    <h2 id="monthLabel" class="text-lg font-bold text-slate-900"></h2>
    <p class="mb-0 text-xs text-slate-400">2028</p>
  </div>
  <button id="nextMonth" type="button" class="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Next month">→</button>
</div>

<div class="mb-5 flex flex-wrap gap-4 text-xs text-slate-500">
  <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-blue-500"></span> <span class="card-en">Daily Reading</span><span class="card-zh">每日讀經</span></span>
  <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-emerald-500"></span> <span class="card-en">Review Day</span><span class="card-zh">複習日</span></span>
  <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-amber-400"></span> <span class="card-en">Today</span><span class="card-zh">今天</span></span>
</div>

<div id="calendarGrid" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"></div>

<script>
(function() {
  var YEAR = 2028;
  var baseUrl = '{{ site.baseurl }}';
  var monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var monthsZh = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'];
  var weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  var calendarMap;
  var unitsById;
  var readingPlan;
  var today = new Date();
  var currentMonth = today.getFullYear() === YEAR ? today.getMonth() + 1 : 1;
  var languageIsZh = false;
  var readingCount = 0;
  var reviewCount = 0;

  var status = document.getElementById('calendarStatus');
  var grid = document.getElementById('calendarGrid');
  var label = document.getElementById('monthLabel');

  function dateKey(month, day) {
    return month + '/' + day;
  }

  function daysInMonth(month) {
    return new Date(Date.UTC(YEAR, month, 0)).getUTCDate();
  }

  function resolveEntry(month, day) {
    var value = calendarMap[dateKey(month, day)];
    if (value === 'review') return { review: true, code: 'Review' };
    var unit = unitsById.get(value);
    return unit ? { review: false, code: unit.code, unit: unit } : null;
  }

  function updateLanguage() {
    languageIsZh = window.Mansli7Lang && window.Mansli7Lang.getCurrentLang() === 'zh';
    renderMonth();
  }

  function updateStatus() {
    status.textContent = languageIsZh
      ? '2028 年對應表已載入 ' + readingCount + ' 個讀經單元及 ' + reviewCount + ' 個複習日。'
      : readingCount + ' reading units and ' + reviewCount + ' review days loaded from the 2028 year map.';
  }

  function reviewTargets(month, day) {
    var current = new Date(Date.UTC(YEAR, month - 1, day));
    var targets = [];
    for (var offset = 1; offset <= 6; offset += 1) {
      var previous = new Date(current);
      previous.setUTCDate(current.getUTCDate() - offset);
      if (previous.getUTCFullYear() !== YEAR) continue;
      var entry = resolveEntry(previous.getUTCMonth() + 1, previous.getUTCDate());
      if (!entry || entry.review) continue;
      var parsed = readingPlan.parse(entry.code);
      if (!parsed.sq || !parsed.sqStatus || !parsed.sqStatus.available) continue;
      targets.push({
        en: parsed.en,
        zh: parsed.zh,
        hrefEn: readingPlan.exactSqHref('en', parsed),
        hrefZh: readingPlan.exactSqHref('zh', parsed)
      });
    }
    return targets.reverse();
  }

  function renderMonth() {
    label.textContent = languageIsZh ? monthsZh[currentMonth - 1] : monthsEn[currentMonth - 1];
    updateStatus();
    document.getElementById('previousMonth').disabled = currentMonth === 1;
    document.getElementById('nextMonth').disabled = currentMonth === 12;
    var html = '';
    for (var day = 1; day <= daysInMonth(currentMonth); day += 1) {
      var entry = resolveEntry(currentMonth, day);
      if (!entry) continue;
      var cardId = 'card-' + currentMonth + '-' + day;
      var isToday = today.getFullYear() === YEAR && today.getMonth() + 1 === currentMonth && today.getDate() === day;
      var weekday = new Date(Date.UTC(YEAR, currentMonth - 1, day)).getUTCDay();
      var parsed = entry.review ? null : readingPlan.parse(entry.code);
      var title = entry.review
        ? (languageIsZh ? '複習日' : 'Review Day')
        : (languageIsZh ? parsed.zh : parsed.en);
      var strip = isToday ? '#f59e0b' : (entry.review ? '#10b981' : '#3b82f6');
      html += '<article class="cal-card"' + (isToday ? ' data-today="true" style="border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.15), 0 4px 12px rgba(0,0,0,0.08);"' : '') + '>';
      html += '<div class="cal-strip" style="background:' + strip + '">';
      html += '<span class="cal-strip-month">' + (languageIsZh ? monthsZh[currentMonth - 1] + ' ' + day + ' 日 · ' + weekdaysZh[weekday] : monthsEn[currentMonth - 1].slice(0, 3).toUpperCase() + ' ' + day + ' · ' + weekdaysEn[weekday].toUpperCase()) + '</span>';
      html += '<span class="cal-strip-daycount">' + (languageIsZh ? '第 ' + Math.round((Date.UTC(YEAR, currentMonth - 1, day) - Date.UTC(YEAR, 0, 0)) / 86400000) + ' / 366 天' : 'Day ' + Math.round((Date.UTC(YEAR, currentMonth - 1, day) - Date.UTC(YEAR, 0, 0)) / 86400000) + ' / 366') + '</span>';
      html += '</div><div class="cal-body"><p class="cal-title">' + title + '</p>';
      if (isToday) html += '<span class="cal-today-badge">' + (languageIsZh ? '今日' : 'Today') + '</span>';
      if (entry.review) {
        html += '<p class="mb-0 text-sm leading-relaxed text-slate-500">' + (languageIsZh ? '重讀本週經文、禱告並整理筆記。' : 'Revisit this week\'s readings, pray, and make notes.') + '</p>';
        var targets = reviewTargets(currentMonth, day);
        if (targets.length) {
          html += '<div style="display:flex;flex-wrap:wrap;gap:0.45rem;margin-top:0.65rem;">';
          targets.forEach(function(target) {
            html += '<a class="cal-chip" href="' + baseUrl + (languageIsZh ? target.hrefZh : target.hrefEn) + '">' + (languageIsZh ? target.zh : target.en) + '</a>';
          });
          html += '</div>';
        }
      } else {
        html += '<span class="cal-badge ' + (parsed.sqStatus && parsed.sqStatus.available ? 'ready' : 'soon') + '">' + (languageIsZh ? (parsed.sqStatus && parsed.sqStatus.available ? '問題集已提供' : '問題集即將提供') : (parsed.sqStatus && parsed.sqStatus.available ? 'Question set ready' : 'Question set coming soon')) + '</span>';
        html += '<div>';
        if (readingPlan.bibleReaderHref && parsed.abbr) html += '<a href="' + readingPlan.bibleReaderHref(parsed, languageIsZh ? 'zh' : 'en') + '" title="' + (languageIsZh ? '在本站閱讀' : 'Read on this site') + '" class="cal-bg-link">' + (languageIsZh ? '📖 本站閱讀' : '📖 Read here') + '</a> ';
        var bgUrlForCard = parsed.abbr && readingPlan.bgUrl ? readingPlan.bgUrl(parsed.abbr, parsed.chapters, languageIsZh ? 'CUV' : 'NIV', languageIsZh ? 'zh' : 'en') : parsed.bg;
        if (bgUrlForCard) html += '<a href="' + bgUrlForCard + '" target="_blank" rel="noopener" title="' + (languageIsZh ? '在 BibleGateway 開啟' : 'Open in BibleGateway') + '" class="cal-bg-link">↗ BibleGateway</a>';
        html += '</div>';
        var panelLabel = parsed.sqStatus && parsed.sqStatus.available
          ? (languageIsZh ? '📖 打開問題面板' : '📖 Open Question Panel')
          : (languageIsZh ? '📖 查看問題狀態' : '📖 View Question Status');
        html += '<button type="button" class="question-button cal-sq-btn" data-code="' + encodeURIComponent(entry.code) + '" aria-expanded="false" aria-controls="questions-' + cardId + '"><span>' + panelLabel + '</span><span class="sq-chevron">▾</span></button>';
        html += '<div id="questions-' + cardId + '" class="question-panel sq-panel" aria-live="polite"></div>';
      }
      html += '</div></article>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.question-button').forEach(function(button) {
      button.addEventListener('click', function() { showQuestions(button); });
    });
  }

  function showQuestions(button) {
    var code = decodeURIComponent(button.getAttribute('data-code'));
    var cardPanel = button.parentNode.querySelector('.question-panel');
    var wasOpen = cardPanel.style.display === 'block';
    grid.querySelectorAll('.question-panel').forEach(function(otherPanel) {
      otherPanel.style.display = 'none';
      otherPanel.innerHTML = '';
    });
    grid.querySelectorAll('.question-button .sq-chevron').forEach(function(chevron) { chevron.textContent = '▾'; });
    grid.querySelectorAll('.question-button').forEach(function(otherButton) { otherButton.setAttribute('aria-expanded', 'false'); });
    if (wasOpen) return;

    var parsed = readingPlan.parse(code);
    button.setAttribute('aria-expanded', 'true');
    button.querySelector('.sq-chevron').textContent = '▴';
    cardPanel.style.display = 'block';
    cardPanel.innerHTML = '<p class="sq-title">' + (languageIsZh ? '學習問題' : 'Study Questions') + '</p><p class="sq-para">' + (languageIsZh ? '正在載入問題...' : 'Loading questions...') + '</p>';
    readingPlan.getPromptsFor(code).then(function(result) {
      if (cardPanel.style.display !== 'block') return;
      var prompts = result && (languageIsZh ? result.zh : result.en);
      var href = readingPlan.exactSqHref(languageIsZh ? 'zh' : 'en', parsed);
      var html = '<p class="sq-title">' + (languageIsZh ? '學習問題' : 'Study Questions') + '</p>';
      if (prompts && prompts.length) {
        var questionLines = prompts.reduce(function(lines, prompt) {
          return lines.concat(String(prompt).match(/[^?？]+[?？]|[^?？]+$/g) || []);
        }, []).map(function(line) { return line.trim(); }).filter(Boolean);
        html += questionLines.map(function(question) { return '<p class="sq-para">' + question + '</p>'; }).join('');
      } else {
        html += '<p class="sq-para">' + (languageIsZh ? '此書卷目前沒有可載入的對應問題。' : 'No matching prompts are currently available for this reading.') + '</p>';
      }
      html += '<a class="cal-bg-link" href="' + href + '">' + (languageIsZh ? '打開完整書卷問題頁面 →' : 'Open full book question page →') + '</a>';
      cardPanel.innerHTML = html;
    }).catch(function() {
      cardPanel.innerHTML = '<p class="sq-para" style="color:#b91c1c;">Could not load study questions for this reading.</p>';
    });
  }

  document.getElementById('previousMonth').addEventListener('click', function() {
    if (currentMonth > 1) { currentMonth -= 1; renderMonth(); }
  });
  document.getElementById('nextMonth').addEventListener('click', function() {
    if (currentMonth < 12) { currentMonth += 1; renderMonth(); }
  });

  Promise.all([
    fetch(baseUrl + '/data/reading-plans/year-2028.json').then(function(response) { if (!response.ok) throw new Error('Calendar map failed to load'); return response.json(); }),
    fetch(baseUrl + '/data/reading-plans/unit-registry-314.json').then(function(response) { if (!response.ok) throw new Error('Unit registry failed to load'); return response.json(); })
  ]).then(function(results) {
    readingPlan = window.Mansli7Reading2026;
    if (!readingPlan) throw new Error('Production reading-code parser failed to load');
    calendarMap = results[0].map;
    unitsById = new Map(results[1].units.map(function(unit) { return [unit.id, unit]; }));
    readingCount = Object.values(calendarMap).filter(function(value) { return value !== 'review'; }).length;
    reviewCount = Object.values(calendarMap).filter(function(value) { return value === 'review'; }).length;
    languageIsZh = window.Mansli7Lang && window.Mansli7Lang.getCurrentLang() === 'zh';
    renderMonth();
    document.addEventListener('mansli7:langchange', updateLanguage);
  }).catch(function(error) {
    status.textContent = error.message;
    status.className = 'mt-2 text-sm text-red-700';
  });
})();
</script>
