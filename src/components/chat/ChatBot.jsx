import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { openWhatsApp } from "../../services/whatsappService";
import { useData } from "../../hooks/useData";

export default function ChatBot() {
  const { t, i18n } = useTranslation();
  const { faqs, settings } = useData();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);
  // FAQ редактируются в админ-панели (таблица faqs). Пока их нет — берём из файлов переводов.
  const fromDb = faqs.filter((f) => f.lang === i18n.resolvedLanguage);
  const fallback = t("chat.faq", { returnObjects: true });
  const list = fromDb.length ? fromDb : Array.isArray(fallback) ? fallback : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Выбираем вопрос, у которого больше всего совпавших ключевых слов
  // (иначе «Во сколько заезд?» находил ответ про цены по слову «сколько»).
  const reply = (text) => {
    const q = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const f of list) {
      const score = f.keywords.filter((k) => q.includes(k)).length;
      if (score > bestScore) {
        best = f;
        bestScore = score;
      }
    }
    return best ? best.answer : t("chat.fallback");
  };

  const ask = (text, answer = reply(text)) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "me", text }, { from: "bot", text: answer }]);
    setInput("");
  };

  return (
    <div className="chat">
      {open && (
        <div className="chat__window" role="dialog" aria-label={t("chat.title")}>
          <div className="chat__head">
            <b>{t("chat.title")}</b>
            <button type="button" className="modal__close" aria-label={t("common.close")} onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="chat__body">
            <p className="chat__msg chat__msg--bot">{t("chat.hello")}</p>
            {messages.map((m, i) => (
              <p key={i} className={`chat__msg chat__msg--${m.from}`}>{m.text}</p>
            ))}
            <div ref={endRef} />
          </div>
          <div className="chat__quick">
            {list.filter((f) => !f.hidden).map((f) => (
              <button key={f.question} type="button" onClick={() => ask(f.question, f.answer)}>{f.question}</button>
            ))}
            <button type="button" onClick={() => openWhatsApp("", settings.contacts.whatsapp)}>WhatsApp</button>
          </div>
          <form className="chat__form" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
            <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("chat.placeholder")} />
            <button className="btn btn--primary" type="submit">{t("chat.send")}</button>
          </form>
        </div>
      )}
      <button type="button" className="chat__toggle" aria-label={t("chat.title")} onClick={() => setOpen(!open)}>💬</button>
    </div>
  );
}
