---
layout: default
title: 2027 Bible Reading Calendar
---

<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <div>
    <p class="card-en mb-2 text-xs font-bold uppercase tracking-widest text-indigo-500">Test Site</p>
    <p class="card-zh mb-2 text-xs font-bold uppercase tracking-widest text-indigo-500">測試網站</p>
    <h1 class="card-en" style="font-size:1.875rem;">2027 Bible Reading Calendar</h1>
    <h1 class="card-zh" style="font-size:1.875rem;">2027 讀經月曆</h1>
    <p id="calendarStatus" class="mt-2 text-sm text-slate-500">Loading 2027 calendar data...</p>
  </div>
  <a href="/bs/ar/" class="inline-flex items-center gap-1 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">← Plan Hub</a>
</div>

<div class="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-5 text-sm leading-relaxed text-slate-700">
  <p class="card-en mb-0">This test calendar loads the 2027 date-to-unit map, resolves each stable unit ID to its existing reading code, and then uses the same study-question content as production.</p>
  <p class="card-zh mb-0">此測試月曆載入 2027 日期到單元的對應表，將穩定單元 ID 解析為既有讀經代碼，並使用與正式網站相同的學習問題內容。</p>
</div>

<div class="mb-5 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
  <button id="previousMonth" type="button" class="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Previous month">←</button>
  <div class="text-center">
    <h2 id="monthLabel" class="text-lg font-bold text-slate-900"></h2>
    <p class="mb-0 text-xs text-slate-400">2027</p>
  </div>
  <button id="nextMonth" type="button" class="rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label="Next month">→</button>
</div>

<div class="mb-5 flex flex-wrap gap-4 text-xs text-slate-500">
  <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-blue-500"></span> <span class="card-en">Daily Reading</span><span class="card-zh">每日讀經</span></span>
  <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded-sm bg-emerald-500"></span> <span class="card-en">Review Day</span><span class="card-zh">複習日</span></span>
</div>

<div id="calendarGrid" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"></div>

<script>
(function() {
  var YEAR = 2027;
  var baseUrl = '{{ site.baseurl }}';
  var monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var monthsZh = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'];
  var weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  var calendarMap;
  var unitsById;
  var readingPlan;
  var currentMonth = 1;
  var languageIsZh = false;

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

  function renderMonth() {
    label.textContent = languageIsZh ? monthsZh[currentMonth - 1] : monthsEn[currentMonth - 1];
    document.getElementById('previousMonth').disabled = currentMonth === 1;
    document.getElementById('nextMonth').disabled = currentMonth === 12;
    var html = '';
    for (var day = 1; day <= daysInMonth(currentMonth); day += 1) {
      var entry = resolveEntry(currentMonth, day);
      if (!entry) continue;
      var weekday = new Date(Date.UTC(YEAR, currentMonth - 1, day)).getUTCDay();
      var title = entry.review
        ? (languageIsZh ? '複習日' : 'Review Day')
        : (languageIsZh ? entry.unit.language.zh : entry.unit.language.en);
      var strip = entry.review ? '#10b981' : '#3b82f6';
      html += '<article class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">';
      html += '<div style="background:' + strip + '" class="px-4 py-2 text-xs font-semibold text-white">';
      html += (languageIsZh ? monthsZh[currentMonth - 1] + ' ' + day + ' 日 · ' + weekdaysZh[weekday] : monthsEn[currentMonth - 1].slice(0, 3).toUpperCase() + ' ' + day + ' · ' + weekdaysEn[weekday].toUpperCase());
      html += '</div><div class="p-4"><h3 class="mb-3 text-base font-bold text-slate-900">' + title + '</h3>';
      if (entry.review) {
        html += '<p class="mb-0 text-sm leading-relaxed text-slate-500">' + (languageIsZh ? '重讀本週經文、禱告並整理筆記。' : 'Revisit this week\'s readings, pray, and make notes.') + '</p>';
      } else {
        html += '<p class="mb-3 text-xs text-slate-400">' + entry.unit.id + ' · ' + entry.code + '</p>';
        html += '<button type="button" class="question-button rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100" data-code="' + entry.code + '">' + (languageIsZh ? '查看學習問題' : 'View Study Questions') + '</button>';
        html += '<div class="question-panel mt-4 hidden border-t border-slate-200 pt-4" aria-live="polite"></div>';
      }
      html += '</div></article>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.question-button').forEach(function(button) {
      button.addEventListener('click', function() { showQuestions(button); });
    });
  }

  function showQuestions(button) {
    var code = button.getAttribute('data-code');
    var cardPanel = button.parentNode.querySelector('.question-panel');
    var wasOpen = !cardPanel.classList.contains('hidden');
    grid.querySelectorAll('.question-panel').forEach(function(otherPanel) {
      otherPanel.classList.add('hidden');
      otherPanel.innerHTML = '';
    });
    if (wasOpen) return;

    var parsed = readingPlan.parse(code);
    cardPanel.classList.remove('hidden');
    cardPanel.innerHTML = '<p class="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-500">' + (languageIsZh ? '學習問題' : 'Study Questions') + '</p><h3 class="mb-3 text-base font-bold text-slate-900">' + (languageIsZh ? parsed.zh : parsed.en) + '</h3><p class="text-sm text-slate-500">' + (languageIsZh ? '正在載入問題...' : 'Loading questions...') + '</p>';
    readingPlan.getPromptsFor(code).then(function(result) {
      if (cardPanel.classList.contains('hidden')) return;
      var prompts = result && (languageIsZh ? result.zh : result.en);
      var href = readingPlan.exactSqHref(languageIsZh ? 'zh' : 'en', parsed);
      var html = '<p class="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-500">' + (languageIsZh ? '學習問題' : 'Study Questions') + '</p><h3 class="mb-3 text-base font-bold text-slate-900">' + (languageIsZh ? parsed.zh : parsed.en) + '</h3>';
      if (prompts && prompts.length) {
        html += '<ol class="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-700">' + prompts.map(function(prompt) { return '<li>' + prompt + '</li>'; }).join('') + '</ol>';
      } else {
        html += '<p class="text-sm text-slate-500">' + (languageIsZh ? '此書卷目前沒有可載入的對應問題。' : 'No matching prompts are currently available for this reading.') + '</p>';
      }
      html += '<a class="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800" href="' + href + '">' + (languageIsZh ? '開啟完整書卷問題頁面 →' : 'Open full book question page →') + '</a>';
      cardPanel.innerHTML = html;
    }).catch(function() {
      cardPanel.innerHTML = '<p class="text-sm text-red-700">Could not load study questions for this reading.</p>';
    });
  }

  document.getElementById('previousMonth').addEventListener('click', function() {
    if (currentMonth > 1) { currentMonth -= 1; renderMonth(); }
  });
  document.getElementById('nextMonth').addEventListener('click', function() {
    if (currentMonth < 12) { currentMonth += 1; renderMonth(); }
  });

  Promise.all([
    fetch(baseUrl + '/data/reading-plans/year-2027.json').then(function(response) { if (!response.ok) throw new Error('Calendar map failed to load'); return response.json(); }),
    fetch(baseUrl + '/data/reading-plans/unit-registry-314.json').then(function(response) { if (!response.ok) throw new Error('Unit registry failed to load'); return response.json(); })
  ]).then(function(results) {
    readingPlan = window.Mansli7Reading2026;
    if (!readingPlan) throw new Error('Production reading-code parser failed to load');
    calendarMap = results[0].map;
    unitsById = new Map(results[1].units.map(function(unit) { return [unit.id, unit]; }));
    var readings = Object.values(calendarMap).filter(function(value) { return value !== 'review'; }).length;
    var reviews = Object.values(calendarMap).filter(function(value) { return value === 'review'; }).length;
    status.textContent = readings + ' reading units and ' + reviews + ' review days loaded from the 2027 year map.';
    languageIsZh = window.Mansli7Lang && window.Mansli7Lang.getCurrentLang() === 'zh';
    renderMonth();
    document.addEventListener('mansli7:langchange', updateLanguage);
  }).catch(function(error) {
    status.textContent = error.message;
    status.className = 'mt-2 text-sm text-red-700';
  });
})();
</script>
