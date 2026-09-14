'use strict';
/* ============================================================================
   Minimal, dependency-free SMTP client for the contact & feedback forms.
   Supports AUTH LOGIN (username/password) with STARTTLS upgrade.
   ========================================================================== */
const net = require('net');
const tls = require('tls');
const crypto = require('crypto');

function encodeHeader(value) {
  return '=?UTF-8?B?' + Buffer.from(String(value), 'utf8').toString('base64') + '?=';
}

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function buildMessage({ from, to, subject, text, html }) {
  const boundary = '----=_fm_' + crypto.randomBytes(12).toString('hex');
  const safeText = String(text || '');
  const safeHtml = html || '<p>' + escHtml(safeText).replace(/\n/g, '<br>') + '</p>';
  const parts = [
    'From: ' + from,
    'To: ' + to,
    'Subject: ' + encodeHeader(subject),
    'MIME-Version: 1.0',
    'Date: ' + new Date().toUTCString(),
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    '',
    '--' + boundary,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    safeText,
    '--' + boundary,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    safeHtml,
    '--' + boundary + '--',
    '.'
  ];
  return parts.join('\r\n');
}

function sendMail(cfg, message) {
  return new Promise((resolve, reject) => {
    if (!cfg || !cfg.host || !cfg.from || !cfg.to) {
      return reject(new Error('SMTP is not fully configured (host/from/to required)'));
    }
    const host = cfg.host;
    const port = Number(cfg.port) || 465;
    const secure = cfg.secure === undefined ? (port === 465) : !!cfg.secure;
    const user = cfg.user || '';
    const pass = cfg.pass || '';

    let sock;
    let buffer = '';
    let replyLines = [];
    let current = null;
    let waitingGreeting = null;
    let settled = false;

    const fail = err => {
      if (settled) return;
      settled = true;
      try { sock.destroy(); } catch (e) { /* ignore */ }
      reject(err);
    };
    const done = () => {
      if (settled) return;
      settled = true;
      try { sock.destroy(); } catch (e) { /* ignore */ }
      resolve();
    };

    function onData(chunk) {
      buffer += chunk.toString('utf8');
      let i;
      while ((i = buffer.indexOf('\n')) !== -1) {
        const rawLine = buffer.slice(0, i).replace(/\r$/, '');
        buffer = buffer.slice(i + 1);
        const m = rawLine.match(/^(\d{3})([ -])(.*)$/);
        if (m) {
          replyLines.push(rawLine);
          if (m[2] === ' ') {
            const pending = current;
            current = null;
            const reply = replyLines.slice();
            replyLines = [];
            const code = parseInt(m[1], 10);
            if (pending) {
              if (pending.codes.includes(code)) pending.res({ code, reply });
              else pending.rej(new Error('SMTP unexpected reply: ' + reply.join(' | ')));
            } else if (waitingGreeting) {
              waitingGreeting({ code, reply });
            }
          }
        } else if (current) {
          replyLines.push(rawLine);
        }
      }
    }

    function bindSocket(s) {
      s.setTimeout(20000, () => fail(new Error('SMTP timeout')));
      s.on('error', fail);
      s.on('data', onData);
    }

    function waitReply(codes) {
      return new Promise((res, rej) => { current = { codes, res, rej }; });
    }
    function sendAndWait(line, codes) {
      sock.write(line + '\r\n');
      return waitReply(codes);
    }

    async function run() {
      try {
        if (!secure) {
          await new Promise((res, rej) => {
            waitingGreeting = r => (r.code === 220 ? res() : rej(new Error('SMTP bad greeting: ' + r.reply.join(' | '))));
            setTimeout(() => rej(new Error('SMTP greeting timeout')), 10000);
          });
          let ehlo = await sendAndWait('EHLO ' + host, [250]);
          if (ehlo.reply.join('\n').toUpperCase().includes('STARTTLS')) {
            await sendAndWait('STARTTLS', [220]);
            const t = tls.connect({ socket: sock, servername: host, rejectUnauthorized: false });
            bindSocket(t);
            await new Promise((res, rej) => {
              t.once('secureConnect', res);
              t.once('error', rej);
            });
            sock = t;
            await sendAndWait('EHLO ' + host, [250]);
          }
        } else {
          await sendAndWait('EHLO ' + host, [250]);
        }

        if (user) {
          await sendAndWait('AUTH LOGIN', [334]);
          await sendAndWait(Buffer.from(user, 'utf8').toString('base64'), [334]);
          await sendAndWait(Buffer.from(pass, 'utf8').toString('base64'), [235]);
        }

        await sendAndWait('MAIL FROM: <' + cfg.from + '>', [250, 251]);
        await sendAndWait('RCPT TO: <' + cfg.to + '>', [250, 251]);
        await sendAndWait('DATA', [354]);
        sock.write(buildMessage(Object.assign({ from: cfg.from, to: cfg.to }, message)) + '\r\n');
        await waitReply([250]);
        await sendAndWait('QUIT', [221, 250]);
        done();
      } catch (e) {
        fail(e);
      }
    }

    if (secure) {
      sock = tls.connect({ host, port, servername: host, rejectUnauthorized: false });
      bindSocket(sock);
      sock.once('secureConnect', run);
    } else {
      sock = net.connect({ port, host });
      bindSocket(sock);
      sock.once('connect', run);
    }
  });
}

module.exports = { sendMail, buildMessage, escHtml };