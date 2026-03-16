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
const roomCalendars: Record<string, { name: string; url: string; color: string; textColor?: string }> = {
  BowheadWhale_MeetingRoom1: {
    name: 'Bowhead Whale (Meeting Room 1)',
    url: 'https://snowy-frost-a564.joachim-c37.workers.dev?room=BowheadWhale_MeetingRoom1',
    color: '#A65CC1',
    textColor: '#FFFFFF'
  },
  GreenlandShark_MeetingRoom2: {
    name: 'Greenland Shark (Meeting Room 2)',
    url: 'https://snowy-frost-a564.joachim-c37.workers.dev?room=GreenlandShark_MeetingRoom2',
    color: '#7B8F97',
    textColor: '#000000'
  },
  ImmortalJellyfish_MeetingRoom3: {
    name: 'Immortal Jellyfish (Meeting Room 3)',
    url: 'https://snowy-frost-a564.joachim-c37.workers.dev?room=ImmortalJellyfish_MeetingRoom3',
    color: '#D1007A',
    textColor: '#FFFFFF'
  },
  LakeSturgeon_MeetingRoom4: {
    name: 'Lake Sturgeon (Meeting Room 4)',
    url: 'https://snowy-frost-a564.joachim-c37.workers.dev?room=LakeSturgeon_MeetingRoom4',
    color: '#F0D400',
    textColor: '#000000'
  },
  JapaneseKoi_MeetingRoom5: {
    name: 'Japanese Koi (Meeting Room 5)',
    url: 'https://snowy-frost-a564.joachim-c37.workers.dev?room=JapaneseKoi_MeetingRoom5',
    color: '#17C964',
    textColor: '#000000'
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
    initialView: 'timeGridWeek',
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
  console.log('Loading room:', roomConfig.name);
  console.log('ICS URL:', roomConfig.url);
  enableSpinner();

  const backgroundColor = roomConfig.color;
  const textColor = roomConfig.textColor || '#000000';

  addFile(roomConfig.name, backgroundColor, textColor);

  addToCalendar(roomConfig.url, backgroundColor, textColor)
    .catch(() => showLoadingError('Error loading calendar.'))
    .finally(() => disableSpinner());
});
