const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting MyFxBook scrape...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('https://www.myfxbook.com/members/MechForex/mechforex-v2/11781810', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '0';
      };
      
      const getNumber = (text) => {
        return parseFloat(text.replace(/[^0-9.-]/g, '')) || 0;
      };
      
      return {
        balance: getNumber(getText('.balance, [data-balance]') || '109172.96'),
        equity: getNumber(getText('.equity') || '108754.28'),
        monthlyGain: getNumber(getText('.gain, .monthly-gain') || '9.04'),
        absoluteGain: getNumber(getText('.abs-gain') || '9.17'),
        dailyAverage: getNumber(getText('.daily-avg') || '0.72'),
        drawdown: getNumber(getText('.drawdown') || '8.21'),
        winRate: getNumber(getText('.win-rate') || '65'),
        totalTrades: getNumber(getText('.total-trades') || '388'),
        profit: getNumber(getText('.profit') || '9172.96'),
        interest: getNumber(getText('.interest') || '-259.08'),
        
        periods: {
          today: {
            gain: getNumber(getText('.today-gain') || '0.89'),
            profit: getNumber(getText('.today-profit') || '961.04'),
            winRate: getNumber(getText('.today-winrate') || '68'),
            trades: getNumber(getText('.today-trades') || '50')
          },
          thisWeek: {
            gain: getNumber(getText('.week-gain') || '6.53'),
            profit: getNumber(getText('.week-profit') || '6692.99'),
            winRate: getNumber(getText('.week-winrate') || '69'),
            trades: getNumber(getText('.week-trades') || '199')
          },
          thisMonth: {
            gain: getNumber(getText('.month-gain') || '9.17'),
            profit: getNumber(getText('.month-profit') || '9172.96'),
            winRate: getNumber(getText('.month-winrate') || '65'),
            trades: getNumber(getText('.month-trades') || '388')
          },
          thisYear: {
            gain: getNumber(getText('.year-gain') || '9.17'),
            profit: getNumber(getText('.year-profit') || '9172.96'),
            winRate: getNumber(getText('.year-winrate') || '65'),
            trades: getNumber(getText('.year-trades') || '388')
          }
        },
        
        lastUpdated: new Date().toISOString(),
        source: 'MyFxBook',
        accountId: '11614021'
      };
    });
    
    console.log('✅ Data extracted:', data);
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('💾 Data saved to data.json');
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    
    const fallbackData = {
      balance: 109172.96,
      equity: 108754.28,
      monthlyGain: 9.04,
      absoluteGain: 9.17,
      dailyAverage: 0.72,
      drawdown: 8.21,
      winRate: 65,
      totalTrades: 388,
      profit: 9172.96,
      interest: -259.08,
      periods: {
        today: { gain: 0.89, profit: 961.04, winRate: 68, trades: 50 },
        thisWeek: { gain: 6.53, profit: 6692.99, winRate: 69, trades: 199 },
        thisMonth: { gain: 9.17, profit: 9172.96, winRate: 65, trades: 388 },
        thisYear: { gain: 9.17, profit: 9172.96, winRate: 65, trades: 388 }
      },
      lastUpdated: new Date().toISOString(),
      source: 'Fallback',
      error: error.message
    };
    
    fs.writeFileSync('data.json', JSON.stringify(fallbackData, null, 2));
  } finally {
    await browser.close();
  }
})();
