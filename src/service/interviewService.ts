export const getTemplateForCurrentWeek = () => {
  const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 for Sunday, 1 for Monday, and so on
  const remainingDays = daysOfWeek.slice(currentDayIndex); // Remaining days in the week
  
  const template = remainingDays.map((day, index) => {
    const dayOfWeek = daysOfWeek[currentDayIndex + index];
    return `${dayOfWeek}: XX:XX-XX:XX`; // Replace XX:XX-XX:XX with the time format
  }).join('\n');
  
  return template;
};