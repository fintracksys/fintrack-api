export function extractDateTimeFromElement($: any): {
  dateTicket: Date | null;
  timeTicket: string | null;
} {
  const dateTimeText1 = $('#infos div:first-child div ul li')
    .contents()
    .eq(2)
    .text()
    .trim();
  const dateTimeText2 = $('#infos div:first-child div ul li').text().trim();
  const dateTimeText3 = $('#infos div div ul li')
    .contents()
    .eq(2)
    .text()
    .trim();
  const dateTimeText4 = $('#infos div div ul li').text().trim();
  const dateTimeText5 = $('#infos').text().trim();

  const dateTimeText =
    dateTimeText1 ||
    dateTimeText2 ||
    dateTimeText3 ||
    dateTimeText4 ||
    dateTimeText5;

  return extractDateAndTime(dateTimeText);
}

export function extractDateAndTime(text: string): {
  dateTicket: Date | null;
  timeTicket: string | null;
} {
  if (!text) {
    return { dateTicket: null, timeTicket: null };
  }

  // Regex para capturar data no formato DD/MM/AAAA
  const dateRegex = /(\d{2})\/(\d{2})\/(\d{4})/;
  const dateMatch = text.match(dateRegex);

  // Regex para capturar hora no formato HH:MM:SS
  const timeRegex = /(\d{2}):(\d{2}):(\d{2})/;
  const timeMatch = text.match(timeRegex);

  let dateTicket: Date | null = null;
  let timeTicket: string | null = null;

  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    // Criar Date object (mês é 0-indexado no JavaScript)
    dateTicket = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  if (timeMatch) {
    timeTicket = timeMatch[0]; // Retorna a hora completa HH:MM:SS
  }

  return { dateTicket, timeTicket };
}
