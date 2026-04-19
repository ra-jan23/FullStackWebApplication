import { db } from '@/lib/db';
import { hash } from '@/lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.cartItem.deleteMany();
  await db.ticket.deleteMany();
  await db.highlight.deleteMany();
  await db.matchAnalysis.deleteMany();
  await db.product.deleteMany();
  await db.user.deleteMany();

  // Create demo user
  const demoPassword = await hash('demo123');
  const user = await db.user.create({
    data: {
      email: 'demo@pitchvision.com',
      name: 'Football Fan',
      password: demoPassword,
      role: 'user',
    },
  });
  console.log('✅ Created demo user');

  // Create products (jerseys)
  const products = [
    { name: 'Liverpool FC Home Kit 2024/25', description: 'Official Liverpool home jersey with Nike Dri-FIT technology. Features the iconic red design with Liver Bird crest.', price: 89.99, image: '/images/jerseys/liverpool-home.png', team: 'Liverpool FC', category: 'jersey', sizes: 'S,M,L,XL,XXL', stock: 150, rating: 4.8, featured: true },
    { name: 'Chelsea FC Home Kit 2024/25', description: 'Official Chelsea home jersey in royal blue. Premium Adidas quality with embroidered club badge.', price: 84.99, image: '/images/jerseys/chelsea-home.png', team: 'Chelsea FC', category: 'jersey', sizes: 'S,M,L,XL', stock: 120, rating: 4.6, featured: true },
    { name: 'Manchester United Home Kit 2024/25', description: 'Classic red home jersey with Adidas design. Features MUFC crest and authentic match details.', price: 89.99, image: '/images/jerseys/manutd-home.png', team: 'Manchester United', category: 'jersey', sizes: 'S,M,L,XL,XXL', stock: 200, rating: 4.7, featured: true },
    { name: 'Manchester City Home Kit 2024/25', description: 'Sky blue home jersey with Puma design technology. Features Etihad Airways sponsorship.', price: 79.99, image: '/images/jerseys/mancity-home.png', team: 'Manchester City', category: 'jersey', sizes: 'S,M,L,XL', stock: 180, rating: 4.5, featured: false },
    { name: 'AC Milan Home Kit 2024/25', description: 'Iconic red and black striped jersey. Puma design with Rossoneri badge and Serie A details.', price: 84.99, image: '/images/jerseys/acmilan-home.png', team: 'AC Milan', category: 'jersey', sizes: 'S,M,L,XL', stock: 90, rating: 4.7, featured: true },
    { name: 'Juventus Home Kit 2024/25', description: 'Black and white striped home jersey with Adidas. Features the iconic J logo and premium materials.', price: 82.99, image: '/images/jerseys/juventus-home.png', team: 'Juventus', category: 'jersey', sizes: 'S,M,L,XL', stock: 110, rating: 4.4, featured: false },
    { name: 'Borussia Dortmund Home Kit 2024/25', description: 'Vibrant yellow home jersey with Puma. Features the BVB badge and Signal Iduna Park design.', price: 74.99, image: '/images/jerseys/dortmund-home.png', team: 'Borussia Dortmund', category: 'jersey', sizes: 'S,M,L,XL', stock: 95, rating: 4.6, featured: false },
    { name: 'Real Madrid Home Kit 2024/25', description: 'Classic white home jersey with Adidas. Features the prestigious RMCF crest and Emirates Fly Better sponsorship.', price: 94.99, image: '/images/jerseys/realmadrid-home.png', team: 'Real Madrid', category: 'jersey', sizes: 'S,M,L,XL,XXL', stock: 250, rating: 4.9, featured: true },
  ];

  for (const product of products) {
    await db.product.create({ data: product });
  }
  console.log(`✅ Created ${products.length} products`);

  // Create sample highlights
  const highlights = [
    { userId: user.id, title: 'Liverpool vs Manchester City - Thrilling 3-2 Victory', match: 'Liverpool 3-2 Man City', description: 'An incredible match at Anfield with last-minute winner. Salah scored a hat-trick including a stunning solo goal in the 89th minute.', thumbnail: '/images/highlights/goal-moment.png', duration: '8:45', views: 125000 },
    { userId: user.id, title: 'Champions League Final - Epic Penalty Shootout', match: 'Real Madrid vs Liverpool', description: 'The most dramatic Champions League final in years. After a 1-1 draw after extra time, Real Madrid won 4-3 on penalties.', thumbnail: '/images/highlights/celebration.png', duration: '12:30', views: 890000 },
    { userId: user.id, title: 'World Class Bicycle Kick Goal of the Season', match: 'AC Milan vs Juventus', description: 'A breathtaking bicycle kick that stunned the San Siro. One of the best goals ever scored in Serie A.', thumbnail: '/images/highlights/bicycle-kick.png', duration: '3:15', views: 456000 },
    { userId: user.id, title: 'Penalty Save Drama - Last Minute Heroics', match: 'Chelsea vs Arsenal', description: 'Goalkeeper produced an incredible double penalty save in the final 5 minutes to secure a crucial clean sheet.', thumbnail: '/images/highlights/penalty-save.png', duration: '5:20', views: 234000 },
    { userId: user.id, title: 'Free Kick Masterclass - 35 Yard Screamer', match: 'Borussia Dortmund vs Bayern Munich', description: 'A sensational 35-yard free kick that left the goalkeeper rooted to the spot. The ball swerved into the top corner.', thumbnail: '/images/highlights/free-kick.png', duration: '4:10', views: 567000 },
  ];

  for (const highlight of highlights) {
    await db.highlight.create({ data: highlight });
  }
  console.log(`✅ Created ${highlights.length} highlights`);

  // Create sample tickets
  const tickets = [
    { userId: user.id, match: 'Premier League - Matchday 28', homeTeam: 'Liverpool FC', awayTeam: 'Arsenal FC', date: '2025-03-15', time: '17:30', venue: 'Anfield, Liverpool', section: 'Main Stand', seat: 'A-124', price: 75.00, status: 'confirmed' },
    { userId: user.id, match: 'Champions League - Quarter Final', homeTeam: 'Real Madrid', awayTeam: 'Manchester City', date: '2025-04-08', time: '21:00', venue: 'Santiago Bernabeu, Madrid', section: 'Premium', seat: 'VIP-42', price: 250.00, status: 'confirmed' },
    { userId: user.id, match: 'FA Cup - Semi Final', homeTeam: 'Chelsea FC', awayTeam: 'Tottenham Hotspur', date: '2025-04-26', time: '16:00', venue: 'Wembley Stadium, London', section: 'Club Level', seat: 'CL-88', price: 120.00, status: 'pending' },
  ];

  for (const ticket of tickets) {
    await db.ticket.create({ data: ticket });
  }
  console.log(`✅ Created ${tickets.length} tickets`);

  // Create sample match analysis
  await db.matchAnalysis.create({
    data: {
      userId: user.id,
      imageUrl: '/images/matches/formation-analysis.png',
      formation: '4-3-3',
      playersCount: 22,
      homeTeam: 'Liverpool FC',
      awayTeam: 'Manchester City',
      analysis: 'Liverpool deployed a 4-3-3 formation with high pressing. Salah and Díaz flanked Jota in attack. The midfield trio of Mac Allister, Szoboszlai, and Gravenberch controlled possession effectively. City countered with their signature 4-3-3 but struggled against Liverpool aggressive press.',
      confidence: 0.92,
    },
  });
  await db.matchAnalysis.create({
    data: {
      userId: user.id,
      imageUrl: '/images/matches/kickoff-lineup.png',
      formation: '4-4-2',
      playersCount: 22,
      homeTeam: 'AC Milan',
      awayTeam: 'Juventus',
      analysis: 'AC Milan used a compact 4-4-2 formation with Leão and Giroud leading the line. The defensive midfield pairing provided excellent cover. Juventus responded with their traditional 4-4-2, focusing on counter-attacks through Chiesa and Vlahović.',
      confidence: 0.88,
    },
  });
  console.log('✅ Created 2 match analyses');

  console.log('\n🎉 Seeding complete!');
  console.log('📧 Demo login: demo@pitchvision.com / demo123');
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
