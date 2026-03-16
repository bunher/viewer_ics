import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import iCalendarPlugin from '@fullcalendar/icalendar';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

let calendar: Calendar;
let spinner: HTMLElement;
let errorElement: HTMLElement;
let fileList: HTMLElement;

// Map short room names to ICS URLs
const roomCalendars: Record<string, { name: string; url: string }> = {
  meetingroom1: {
    name: 'Meeting Room 1',
    url: 'http://outlook.office365.com/owa/calendar/6697040d65084b728ea8a7ef618d5f1b@athebio.com/6469589fd8b646ca807f125ba346d6e416654376312581485711/calendar.html'
  },
  meetingroom2: {
    name: 'Meeting Room 2',
    url: 'http://outlook.office365.com/owa/calendar/69da8a534a9f42acb0e9b235e8a05a89@athebio.com/6ac211ecbe0647c19909faf4eca046b211718558176671469078/calendar.html'
  }
};

function addToCalendar(dataUrl: string, backgroundColor: string, textColor: string): Promise<void> {
  return new Promise(function (resolve) {
    const input = {
      url: dataUrl,
      format: 'ics',
      color: backgroundColor,
      textColor: textColor,
    };
    calendar.addEventSource(input);
    resolve();
  });
}

function enableSpinner() {
  if (!spinner.classList.contains('show')) spinner.classList.add('show');
}

function disableSpinner() {
  if (spinner.classList.contains('show')) spinner.classList.remove('show');
}

function showLoadingError(message?: string) {
  if (message) {
    errorElement.textContent = message;
  }
  if (!errorElement.classList.contains('show')) errorElement.classList.add('show');
}

function hideLoadingError() {
  if (errorElement.classList.contains('show')) errorElement.classList.remove('show');
}

function addFile(fileName: string, backgroundColor: string, textColor: string) {
  fileList.insertAdjacentHTML(
    'beforeend',
    `<div class="rounded px-2 py-1" style="background-color: ${backgroundColor}; color: ${textColor};">${fileName}</div>`
  );
}

function clearListElements() {
  while (fileList.hasChildNodes()) {
    fileList.removeChild(fileList.firstChild!);
  }
}

function getColors(index: number): string[] {
  const hue = index * 137.508;
  const rgb = hsl2rgb(hue, 0.75, 0.75);

  let textColor: string;
  if (colourIsLight(rgb[0], rgb[1], rgb[2])) {
    textColor = 'black';
  } else {
    textColor = 'white';
  }

  return [`hsl(${hue},75%,75%)`, textColor];
}

function hsl2rgb(h: number, s: number, l: number): number[] {
  let a = s * Math.min(l, 1 - l);
  let f = (n: number, k = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

var colourIsLight = function (r: number, g: number, b: number) {
  var a = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return a < 0.5;
};

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar')!;
  spinner = document.getElementById('spinner')!;
  errorElement = document.getElementById('errorText')!;
  fileList = document.getElementById('fileList')!;

  calendar = new Calendar(calendarEl, {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
      multiMonthPlugin,
      bootstrap5Plugin,
      iCalendarPlugin
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek,listMonth,dayGridMonth'
    },
    initialView: 'listMonth',
    themeSystem: 'bootstrap5',
    navLinks: true,
    dayMaxEvents: true,
    height: 'auto'
  });

  calendar.render();

  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');

  hideLoadingError();
  clearListElements();

  if (!room) {
    showLoadingError('No room specified in the URL.');
    return;
  }

  const roomConfig = roomCalendars[room];

  if (!roomConfig) {
    showLoadingError(`Unknown room: ${room}`);
    return;
  }

  enableSpinner();

  const colors = getColors(0);
  addFile(roomConfig.name, colors[0], colors[1]);

  addToCalendar(roomConfig.url, colors[0], colors[1])
    .catch(() => showLoadingError('Error loading calendar.'))
    .finally(() => disableSpinner());
});
