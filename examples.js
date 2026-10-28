/**
 * MailCraft AI - Example Prompts Library
 * Curated scenarios for college students, job seekers, and working professionals.
 */

const EXAMPLE_PROMPTS = [
  {
    id: 'college-assignment-extension',
    title: 'Assignment Deadline Extension',
    category: 'College & Academia',
    badge: 'College',
    topic: 'Requesting a 3-day extension on the Machine Learning Lab Project submission due to illness and high fever over the weekend.',
    recipient: 'Professor',
    customRecipient: 'Prof. S. K. Verma (Dept of CSE)',
    emailType: 'College Assignment',
    tone: 'Polite',
    language: 'English',
    length: 'Medium',
    description: 'Courteous request to a professor for an assignment deadline extension with genuine reason.'
  },
  {
    id: 'leave-request-medical',
    title: 'Medical Sick Leave Request',
    category: 'Workplace & College',
    badge: 'Leave',
    topic: 'Inform that I am down with severe viral flu and doctor has advised 2 days bed rest. Requesting sick leave for Oct 29 and Oct 30.',
    recipient: 'Manager',
    customRecipient: 'Mr. Rajesh Mehra (Engineering Lead)',
    emailType: 'Leave Request',
    tone: 'Professional',
    language: 'English',
    length: 'Short',
    description: 'Quick, formal medical leave notice with handover assurance.'
  },
  {
    id: 'job-application-internship',
    title: 'Software Developer Intern Application',
    category: 'Job & Career',
    badge: 'Career',
    topic: 'Applying for the Full-Stack Developer Internship role at TechCorp. Mention my proficiency in Python, React, and REST APIs, along with GitHub portfolio.',
    recipient: 'HR',
    customRecipient: 'Hiring Team / HR Manager',
    emailType: 'Job Application',
    tone: 'Persuasive',
    language: 'English',
    length: 'Detailed',
    description: 'High-impact cold application email highlighting technical skills and portfolio.'
  },
  {
    id: 'interview-followup',
    title: 'Post-Interview Follow-Up',
    category: 'Job & Career',
    badge: 'Follow-Up',
    topic: 'Following up on the technical round interview conducted last Thursday for the Junior Software Engineer role. Reiterate excitement for the team.',
    recipient: 'HR',
    customRecipient: 'Pooja Sharma (Talent Acquisition)',
    emailType: 'Follow-up',
    tone: 'Professional',
    language: 'English',
    length: 'Medium',
    description: 'Graceful follow-up keeping you top of mind without sounding impatient.'
  },
  {
    id: 'apology-missed-meeting',
    title: 'Apology for Missed Project Meeting',
    category: 'Workplace & College',
    badge: 'Apology',
    topic: 'Apologize for unexpectedly missing the sprint planning review meeting due to an emergency power cut and internet blackout.',
    recipient: 'Manager',
    customRecipient: 'Project Coordinator',
    emailType: 'Apology',
    tone: 'Polite',
    language: 'English',
    length: 'Short',
    description: 'Sincere apology explaining unexpected circumstances and requesting meeting minutes.'
  },
  {
    id: 'recommendation-letter-prof',
    title: 'LOR Request for Master’s Application',
    category: 'College & Academia',
    badge: 'College',
    topic: 'Requesting a Letter of Recommendation (LOR) for upcoming Master of Science (MS in CS) applications for Fall 2027. Mention my A+ grade in DBMS course.',
    recipient: 'Professor',
    customRecipient: 'Dr. Neha Gupta (Associate Professor)',
    emailType: 'Formal',
    tone: 'Polite',
    language: 'English',
    length: 'Detailed',
    description: 'Formal request to academic faculty for higher studies recommendation.'
  },
  {
    id: 'hinglish-friend-project',
    title: 'Hackathon Partner Invitation (Hinglish)',
    category: 'Everyday Communication',
    badge: 'Hinglish',
    topic: 'Bhai Smart India Hackathon ka registration open ho gaya hai. Ek team banani hai frontend aur backend ke liye. Would you like to join as team lead?',
    recipient: 'Friend',
    customRecipient: 'Rohan Sharma',
    emailType: 'Informal',
    tone: 'Friendly',
    language: 'Hinglish',
    length: 'Medium',
    description: 'Casual, friendly Hinglish email inviting a friend to collaborate on a hackathon.'
  },
  {
    id: 'hindi-leave-formal',
    title: 'अवकाश प्रार्थना पत्र (Formal Hindi Leave)',
    category: 'College & Academia',
    badge: 'हिंदी',
    topic: 'पारिवारिक आवश्यक कार्य हेतु दो दिवसीय (कल और परसों) अवकाश हेतु विभागाध्यक्ष को प्रार्थना पत्र।',
    recipient: 'Professor',
    customRecipient: 'विभागाध्यक्ष (HOD CSE)',
    emailType: 'Leave Request',
    tone: 'Polite',
    language: 'Hindi',
    length: 'Medium',
    description: 'Formal, grammatically rich Hindi leave request letter for college or school.'
  },
  {
    id: 'client-thank-you',
    title: 'Client Appreciation & Feedback Thank You',
    category: 'Workplace & Corporate',
    badge: 'Thank You',
    topic: 'Thanking the client for their positive feedback on the Q3 website redesign launch and wishing them continued success.',
    recipient: 'Client',
    customRecipient: 'David Miller (Product Director)',
    emailType: 'Thank You',
    tone: 'Friendly',
    language: 'English',
    length: 'Medium',
    description: 'Warm and professional gratitude email building long-term business relationship.'
  },
  {
    id: 'complaint-mess-facility',
    title: 'Hostel / College Facility Complaint',
    category: 'College & Academia',
    badge: 'Complaint',
    topic: 'Lodging a formal complaint regarding frequent Wi-Fi disconnections and slow speed in Block B hostel during exam preparation week.',
    recipient: 'Manager',
    customRecipient: 'Hostel Warden / IT Admin',
    emailType: 'Complaint',
    tone: 'Urgent',
    language: 'English',
    length: 'Medium',
    description: 'Assertive, well-reasoned complaint highlighting impact on studies.'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EXAMPLE_PROMPTS };
}
