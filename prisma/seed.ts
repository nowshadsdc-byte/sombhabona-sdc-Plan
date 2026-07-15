import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'

async function main() {
  console.log('🌱 Seeding database...')

  // ---- Admin ----
  const adminEmail = 'admin@odctl.org'
  let admin = await db.admin.findUnique({ where: { email: adminEmail } })
  if (!admin) {
    admin = await db.admin.create({
      data: {
        email: adminEmail,
        name: 'Site Administrator',
        passwordHash: hashPassword('admin123'),
        role: 'SUPER_ADMIN',
      },
    })
    console.log('  ✓ admin created:', admin.email)
  }

  // ---- Demo donor ----
  const donorEmail = 'donor@odctl.org'
  let donor = await db.donor.findUnique({ where: { email: donorEmail } })
  if (!donor) {
    donor = await db.donor.create({
      data: {
        name: 'Ayesha Rahman',
        email: donorEmail,
        passwordHash: hashPassword('donor123'),
        phone: '+8801710000001',
        country: 'Bangladesh',
        city: 'Dhaka',
        avatarColor: '#0d9488',
        bio: 'Educator and lifelong supporter of children\'s education.',
        isPublic: true,
      },
    })
    console.log('  ✓ demo donor created:', donor.email)
  }

  // ---- Public demo donors ----
  const demoDonors = [
    { name: 'Tanvir Ahmed', country: 'Bangladesh', city: 'Chattogram', color: '#0d9488', bio: 'Software engineer, believes education changes everything.' },
    { name: 'Nusrat Jahan', country: 'United States', city: 'New York', color: '#ec4899', bio: 'Doctor. Proud to support women\'s livelihoods.' },
    { name: 'David Chen', country: 'Canada', city: 'Toronto', color: '#f59e0b', bio: 'Entrepreneur supporting global education.' },
    { name: 'Fatima Begum', country: 'United Kingdom', city: 'London', color: '#8b5cf6', bio: 'Teacher and community organizer.' },
    { name: 'Rahim Uddin', country: 'Australia', city: 'Sydney', color: '#14b8a6', bio: 'Photographer documenting social impact.' },
    { name: 'Sara Mitchell', country: 'Germany', city: 'Berlin', color: '#ef4444', bio: 'NGO worker focused on women empowerment.' },
  ]
  for (const d of demoDonors) {
    const existing = await db.donor.findFirst({ where: { name: d.name } })
    if (!existing) {
      await db.donor.create({
        data: {
          name: d.name,
          email: `demo.${d.name.toLowerCase().replace(/[^a-z]/g, '.')}@odctl.org`,
          passwordHash: hashPassword('donor123'),
          country: d.country,
          city: d.city,
          avatarColor: d.color,
          bio: d.bio,
          isPublic: true,
        },
      })
    }
  }
  console.log('  ✓ demo donors ensured')

  // ---- Package ----
  let pkg = await db.package.findFirst({ where: { name: 'One Donation, Two Lives' } })
  if (!pkg) {
    pkg = await db.package.create({
      data: {
        name: 'One Donation, Two Lives',
        description:
          'A single donation that transforms two lives: one year of quality education for a child, and a 3-month caregiver training program for a woman.',
        priceUSD: 250,
        priceBDT: 30000,
        childBenefit: 'One full year of quality education at Puspokoli School — books, uniform, tuition, and mentorship.',
        womanBenefit: '3-month professional Caregiver Training Program at SDC, equipping her for sustainable employment.',
        imageColor: '#0d9488',
        active: true,
      },
    })
    console.log('  ✓ package created')
  }

  // ---- Children ----
  const childSeeds = [
    { name: 'Mitu Akter', age: 9, grade: 'Class 3', school: 'Puspokoli School', location: 'Dhaka', background: 'Mitu\'s father is a day laborer. She loves drawing and wants to be a teacher.', dream: 'Become a school teacher', color: '#f59e0b', status: 'AVAILABLE', progress: 10 },
    { name: 'Rakib Hossain', age: 11, grade: 'Class 5', school: 'Puspokoli School', location: 'Gazipur', background: 'Rakib walks 4km to school daily. His mother raises three children alone.', dream: 'Become an engineer', color: '#14b8a6', status: 'AVAILABLE', progress: 25 },
    { name: 'Sadia Islam', age: 8, grade: 'Class 2', school: 'Puspokoli School', location: 'Narayanganj', background: 'Sadia is the first in her family to attend school. She is curious about the stars.', dream: 'Become a scientist', color: '#ec4899', status: 'AVAILABLE', progress: 5 },
    { name: 'Jibon Das', age: 10, grade: 'Class 4', school: 'Puspokoli School', location: 'Khulna', background: 'Jibon\'s family lost their home to flooding. He studies under a lamp at night.', dream: 'Become a doctor', color: '#8b5cf6', status: 'SUPPORTED', progress: 45 },
    { name: 'Tania Parvin', age: 12, grade: 'Class 6', school: 'Puspokoli School', location: 'Dhaka', background: 'Tania helps her mother after school. She excels in mathematics.', dream: 'Become a bank officer', color: '#0d9488', status: 'AVAILABLE', progress: 60 },
    { name: 'Sabbir Rahman', age: 7, grade: 'Class 1', school: 'Puspokoli School', location: 'Cumilla', background: 'Sabbir just started school. He loves reciting poems.', dream: 'Become a poet', color: '#ef4444', status: 'AVAILABLE', progress: 15 },
    { name: 'Nila Khatun', age: 9, grade: 'Class 3', school: 'Puspokoli School', location: 'Mymensingh', background: 'Nila\'s father is a rickshaw puller. She wants to learn computers.', dream: 'Become a computer engineer', color: '#06b6d4', status: 'SUPPORTED', progress: 30 },
    { name: 'Arif Mahmud', age: 11, grade: 'Class 5', school: 'Puspokoli School', location: 'Sylhet', background: 'Arif dreams of building schools in his village.', dream: 'Become a social worker', color: '#84cc16', status: 'GRADUATED', progress: 100 },
  ]
  for (const c of childSeeds) {
    const existing = await db.child.findFirst({ where: { name: c.name } })
    if (!existing) {
      await db.child.create({
        data: {
          name: c.name, age: c.age, gender: c.name.includes('Rakib')||c.name.includes('Jibon')||c.name.includes('Sabbir')||c.name.includes('Arif') ? 'male' : 'female',
          grade: c.grade, school: c.school, location: c.location,
          background: c.background, dream: c.dream, photoColor: c.color,
          status: c.status as any, progressPercent: c.progress,
        },
      })
    }
  }
  console.log('  ✓ children ensured')

  // ---- Women ----
  const womanSeeds = [
    { name: 'Rokeya Begum', age: 28, location: 'Dhaka', familyInfo: 'Widowed mother of two.', background: 'Rokeya struggles to feed her children after her husband passed away. She is determined to build a stable career.', goal: 'Work as a professional caregiver in a hospital', color: '#ec4899', status: 'AVAILABLE', progress: 15 },
    { name: 'Shahida Akter', age: 32, location: 'Gazipur', familyInfo: 'Married, husband is unemployed.', background: 'Shahida wants to contribute to her family income and gain financial independence.', goal: 'Start a home caregiving service', color: '#0d9488', status: 'AVAILABLE', progress: 40 },
    { name: 'Maliha Khatun', age: 25, location: 'Narayanganj', familyInfo: 'Single mother of one daughter.', background: 'Maliha left an abusive marriage. She is rebuilding her life for her daughter.', goal: 'Become a certified elderly caregiver', color: '#f59e0b', status: 'SUPPORTED', progress: 55 },
    { name: 'Jahanara Islam', age: 35, location: 'Khulna', familyInfo: 'Mother of three.', background: 'Jahanara\'s husband is a fisherman with irregular income. She wants a steady job.', goal: 'Work in a nursing home', color: '#8b5cf6', status: 'AVAILABLE', progress: 20 },
    { name: 'Salma Akhter', age: 29, location: 'Cumilla', familyInfo: 'Divorced, no children.', background: 'Salma completed secondary school but never worked. She is ready to learn new skills.', goal: 'Become a caregiver and support her aging parents', color: '#14b8a6', status: 'AVAILABLE', progress: 10 },
    { name: 'Fahmida Yesmin', age: 30, location: 'Mymensingh', familyInfo: 'Married, one son.', background: 'Fahmida\'s husband works in a garment factory. She wants to add to the family income.', goal: 'Care for special-needs patients', color: '#ef4444', status: 'SUPPORTED', progress: 70 },
    { name: 'Halima Begum', age: 27, location: 'Sylhet', familyInfo: 'Single.', background: 'Halima lost her job during the pandemic and wants a new, stable career path.', goal: 'Become a professional home nurse aide', color: '#06b6d4', status: 'AVAILABLE', progress: 0 },
    { name: 'Rashida Khatun', age: 33, location: 'Dhaka', familyInfo: 'Widowed, two children.', background: 'Rashida completed her caregiver training and is now employed at a city hospital.', goal: 'Continue growing her healthcare career', color: '#84cc16', status: 'EMPLOYED', progress: 100 },
  ]
  for (const w of womanSeeds) {
    const existing = await db.woman.findFirst({ where: { name: w.name } })
    if (!existing) {
      await db.woman.create({
        data: {
          name: w.name, age: w.age, location: w.location, familyInfo: w.familyInfo,
          background: w.background, goal: w.goal, photoColor: w.color,
          status: w.status as any, progressPercent: w.progress,
        },
      })
    }
  }
  console.log('  ✓ women ensured')

  // ---- Progress updates ----
  const children = await db.child.findMany()
  const women = await db.woman.findMany()
  const sampleUpdates = [
    { forChild: true, title: 'Enrolled in new term', content: 'Has started the new school term with all books and uniform provided.', milestone: true },
    { forChild: true, title: 'Top of the class in math', content: 'Scored the highest marks in mathematics this month. Teachers are proud!', milestone: false },
    { forChild: false, title: 'First month of training complete', content: 'Successfully completed basic patient-care modules. Learning vital signs monitoring.', milestone: true },
    { forChild: false, title: 'Practical internship begins', content: 'Started a 2-week practical internship at a partner clinic.', milestone: false },
  ]
  // attach a couple of updates to the first supported child + woman
  const sc = children.find(c => c.status === 'SUPPORTED')
  const sw = women.find(w => w.status === 'SUPPORTED')
  if (sc) {
    for (const u of sampleUpdates.filter(u => u.forChild)) {
      const exists = await db.progressUpdate.findFirst({ where: { childId: sc.id, title: u.title } })
      if (!exists) {
        await db.progressUpdate.create({ data: { childId: sc.id, title: u.title, content: u.content, milestone: u.milestone, photoColor: sc.photoColor } })
      }
    }
  }
  if (sw) {
    for (const u of sampleUpdates.filter(u => !u.forChild)) {
      const exists = await db.progressUpdate.findFirst({ where: { womanId: sw.id, title: u.title } })
      if (!exists) {
        await db.progressUpdate.create({ data: { womanId: sw.id, title: u.title, content: u.content, milestone: u.milestone, photoColor: sw.photoColor } })
      }
    }
  }
  console.log('  ✓ progress updates ensured')

  // ---- Site content ----
  const contentDefaults: Record<string, string> = {
    heroBadge: 'A Joint Initiative of Sombhabona × Skills Development Centre (SDC)',
    heroTitle: 'One Donation. Two Lives Changed. A Future Filled with Hope.',
    heroSubtitle: 'With a single donation of USD 250, you give one child a full year of quality education AND one woman a 3-month caregiver training program — building sustainable, measurable, lasting impact.',
    heroCta: 'Sponsor Two Lives Now',
    aboutOrg1Title: 'Sombhabona',
    aboutOrg1Body: 'Since 2011, Sombhabona empowers lives with free education, skill development, relief aid, and ICT training — impacting 1,650+ students and 32,000+ beneficiaries nationwide. Initiatives include Puspokoli School, Onindito Naree Project, Sonirvor Project, Amar Ghor Amar Karkhana, and the Sombhabona ICT Project.',
    aboutOrg2Title: 'Skills Development Centre (SDC)',
    aboutOrg2Body: 'SDC is a premier training platform dedicated to delivering accessible, high-quality, and industry-aligned education across Bangladesh and beyond. SDC equips learners with practical expertise and modern skills that meet the evolving demands of today’s job market — through both online and offline channels.',
    jointTitle: 'One Donation, Change Two Lives',
    jointBody: 'These two organizations have come together to launch a meaningful social impact initiative. With a single donation, a donor transforms the lives of two people. The project is fully managed and implemented by Sombhabona, ensuring every donation is used effectively to create measurable and lasting impact.',
    transparencyTitle: 'Complete Transparency',
    transparencyBody: 'Transparency is at the heart of this initiative. Every donor can see exactly how their contribution makes a difference — from browsing beneficiaries to tracking progress, milestones, and success stories in a secure donor account.',
    packagePriceUSD: '250',
    packagePriceBDT: '30000',
    footerNote: 'One Donation. Two Lives Changed. A Future Filled with Hope.',
  }
  for (const [key, value] of Object.entries(contentDefaults)) {
    const existing = await db.siteContent.findUnique({ where: { key } })
    if (!existing) {
      await db.siteContent.create({ data: { key, value } })
    }
  }
  console.log('  ✓ site content ensured')

  // ---- A demo donation linking donor -> supported child + woman ----
  const tania = children.find(c => c.name === 'Jibon Das')!
  const maliha = women.find(w => w.name === 'Maliha Khatun')!
  const existingDonation = await db.donation.findFirst({ where: { donorId: donor.id, childId: tania.id } })
  if (!existingDonation) {
    await db.donation.create({
      data: {
        donorId: donor.id,
        childId: tania.id,
        womanId: maliha.id,
        packageId: pkg.id,
        amountUSD: 250,
        amountBDT: 30000,
        paymentMethod: 'ONLINE',
        paymentStatus: 'COMPLETED',
        transactionId: 'TXN-DEMO-0001',
        donorMessage: 'Wishing Jibon and Maliha a bright future!',
      },
    })
    await db.child.update({ where: { id: tania.id }, data: { status: 'SUPPORTED' } })
    await db.woman.update({ where: { id: maliha.id }, data: { status: 'SUPPORTED' } })
    console.log('  ✓ demo donation created')
  }

  console.log('🌱 Seed complete.')
  console.log('   Admin login:    admin@odctl.org / admin123')
  console.log('   Donor login:    donor@odctl.org / donor123')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
