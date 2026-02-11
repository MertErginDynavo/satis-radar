// Zamanlanmış görevler için scheduler
// Gerçek uygulamada node-cron veya benzeri bir kütüphane kullanılmalı

import { checkTrialEndingHotels, checkTrialEndedHotels } from './jobs/trialReminder.js';

// Basit scheduler - her 24 saatte bir çalışır
export function startScheduler() {
  console.log('Scheduler started');

  // Her gün saat 10:00'da deneme süresi kontrolü yap
  const checkInterval = 24 * 60 * 60 * 1000; // 24 saat

  // İlk çalıştırma
  runDailyChecks();

  // Sonraki çalıştırmalar
  setInterval(() => {
    runDailyChecks();
  }, checkInterval);
}

export async function runDailyChecks() {
  const now = new Date();
  console.log(`\n=== Running daily checks at ${now.toISOString()} ===`);

  try {
    // 24 saat içinde bitecek denemeleri kontrol et
    console.log('Checking trials ending in 24 hours...');
    const endingResult = await checkTrialEndingHotels();
    console.log('Trial ending check result:', endingResult);

    // Bitmiş denemeleri kontrol et
    console.log('Checking expired trials...');
    const endedResult = await checkTrialEndedHotels();
    console.log('Trial ended check result:', endedResult);

    console.log('=== Daily checks complete ===\n');
  } catch (error) {
    console.error('Error in daily checks:', error);
  }
}
