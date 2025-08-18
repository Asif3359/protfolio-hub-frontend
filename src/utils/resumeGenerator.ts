import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  role: string;
  createdAt: string;
}

interface Profile {
  _id: string;
  userId: string;
  headline: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
  linkedin: string;
  facebook: string;
  github: string;
  portfolioLink: string;
  profileImage: string;
  updatedAt: string;
}

interface Project {
  _id: string;
  userId: string;
  title: string;
  description: string;
  keyFeatures: string[];
  technologies: string[];
  startDate: string;
  status: string;
  images: { url: string; _id: string }[];
  createdAt: string;
  updatedAt: string;
  liveUrl: string;
  repositoryUrl: string;
}

interface Experience {
  _id: string;
  userId: string;
  title: string;
  employmentType: string;
  company: string;
  location: string;
  locationType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  skills: string[];
  media: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Education {
  _id: string;
  userId: string;
  school: string;
  logo: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  currentlyStudying: boolean;
  description: string;
  grade: string;
  activities: string;
  honors: string;
  educationType: string;
  location: string;
  website: string;
  media: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Certification {
  _id: string;
  userId: string;
  title: string;
  issuer: string;
  issuerLogo: string;
  issueDate: string;
  expirationDate: string | null;
  credentialID: string;
  credentialLink: string;
  description: string;
  skills: string[];
  doesNotExpire: boolean;
  media: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  verification: {
    verified: boolean;
  };
}

interface Achievement {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  dateAchieved: string;
  issuer: string;
  issuerLogo: string;
  skillsGained: string[];
  evidence: string;
  visibility: string;
  tags: string[];
  impactDescription: string;
  createdAt: string;
  updatedAt: string;
  verification: {
    verified: boolean;
  };
}

interface Research {
  _id: string;
  userId: string;
  title: string;
  description: string;
  researchField: string;
  publicationDate: string;
  publisher: string;
  publicationType: string;
  doi: string;
  coAuthors: {
    name: string;
    institution: string;
  }[];
  institution: string;
  fundingAgency: string;
  grantNumber: string;
  keywords: string[];
  citations: number;
  isPublished: boolean;
  peerReviewed: boolean;
  impactStatement: string;
  createdAt: string;
  updatedAt: string;
  links: {
    pdf: string;
    projectPage: string;
    codeRepository: string;
  };
}

interface Skill {
  _id: string;
  userId: string;
  name: string;
  category: string;
  proficiency: number;
  learningResources: string[];
  priority: number;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioData {
  user: User;
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  achievements: Achievement[];
  researches: Research[];
  skills: Skill[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

export const generateResumePDF = async (portfolioData: PortfolioData) => {
  const { user, profile, projects, experiences, educations, certifications, achievements, researches, skills } = portfolioData;

  // Create a temporary div to render the resume content
  const resumeDiv = document.createElement('div');
  resumeDiv.style.position = 'absolute';
  resumeDiv.style.left = '-9999px';
  resumeDiv.style.top = '0';
  resumeDiv.style.width = '800px';
  resumeDiv.style.padding = '30px';
  resumeDiv.style.backgroundColor = 'white';
  resumeDiv.style.fontFamily = 'Arial, sans-serif';
  resumeDiv.style.fontSize = '10px';
  resumeDiv.style.lineHeight = '1.3';
  resumeDiv.style.color = '#333';

  // Generate the resume HTML content
  resumeDiv.innerHTML = `<div style="max-width: 800px; margin: 0 auto; padding: 30px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.4; font-size: 14px;">

  <!-- Header Section -->
  <div style="text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e0e0e0;">
    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #2c3e50; letter-spacing: -0.5px;">${user.name}</h1>
    <h2 style="margin: 5px 0 0; font-size: 16px; font-weight: 400; color: #7f8c8d;">${profile.headline}</h2>
    
    <div style="margin-top: 12px; display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; font-size: 12px;">
      <span><i class="fa-solid fa-envelope" style="margin-right: 5px; color: #3498db;"></i>${user.email}</span>
      ${profile.phone ? `<span><i class="fa-solid fa-phone" style="margin-right: 5px; color: #3498db;"></i>${profile.phone}</span>` : ''}
      ${profile.location ? `<span><i class="fa-solid fa-location-dot" style="margin-right: 5px; color: #3498db;"></i>${profile.location}</span>` : ''}
      ${profile.linkedin ? `<span><i class="fab fa-linkedin" style="margin-right: 5px; color: #3498db;"></i>LinkedIn: ${profile.linkedin}</span>` : ''}
      ${profile.github ? `<span><i class="fab fa-github" style="margin-right: 5px; color: #3498db;"></i>GitHub: ${profile.github}</span>` : ''}
    </div>
  </div>

  <!-- Two Column Layout -->
  <div style="display: flex; gap: 30px;">
    
    <!-- Left Column (60% width) -->
    <div style="flex: 3;">
      <!-- Professional Summary -->
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 7px; display: inline-block;">PROFESSIONAL SUMMARY</h3>
        <p style="margin: 0; font-size: 12px; line-height: 1.5;">${profile.bio}</p>
      </div>

      <!-- Experience -->
      ${experiences.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 7px; display: inline-block;">EXPERIENCE</h3>
          ${experiences.slice(0, 3).map(exp => `
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between;">
                <h4 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 600;">${exp.title}</h4>
                <span style="font-size: 12px; color: #7f8c8d;">${formatDate(exp.startDate)} - ${exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <div style="font-size: 13px; font-weight: 500; color: #3498db; margin-bottom: 5px;">${exp.company} | ${exp.location}</div>
              ${exp.skills && exp.skills.length > 0 ? `
                <div style="font-size: 11px; color: #7f8c8d;">
                  <strong>Technologies:</strong> ${exp.skills.join(', ')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Projects -->
      ${projects.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 7px; display: inline-block;">PROJECTS</h3>
          ${projects.slice(0, 2).map(project => `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between;">
                <h4 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 600;">${project.title}</h4>
                <span style="font-size: 12px; color: #7f8c8d;">${formatDate(project.startDate)}</span>
              </div>
              ${project.keyFeatures && project.keyFeatures.length > 0 ? `
                <div style="font-size: 11px; color: #7f8c8d; margin-bottom: 5px;">
                  <strong>Key Features:</strong> ${project.keyFeatures.join(', ')}
                </div>
              ` : ''}
              ${project.technologies && project.technologies.length > 0 ? `
                <div style="font-size: 11px; color: #7f8c8d;">
                  <strong>Tech Stack:</strong> ${project.technologies.join(', ')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Research -->
      ${researches.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 7px; display: inline-block;">RESEARCH</h3>
          ${researches.slice(0, 2).map(research => `
            <div style="margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between;">
                <h4 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 600;">${research.title}</h4>
                <span style="font-size: 12px; color: #7f8c8d;">${formatDate(research.publicationDate)}</span>
              </div>
              <div style="font-size: 13px; font-weight: 500; color: #3498db; margin-bottom: 3px;">${research.publisher} | ${research.researchField}</div>
              ${research.keywords && research.keywords.length > 0 ? `
                <div style="font-size: 11px; color: #7f8c8d;">
                  <strong>Keywords:</strong> ${research.keywords.join(', ')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <!-- Right Column (40% width) -->
    <div style="flex: 2;">
      <!-- Skills -->
      ${skills.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 7px; display: inline-block;">SKILLS</h3>
          ${skills.map(skill => `
            <div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span>${skill.name}</span>
                <span style="color: #7f8c8d;">${skill.proficiency}%</span>
              </div>
              <div style="height: 3px; background: #ecf0f1; margin-top: 4px;">
                <div style="height: 100%; width: ${skill.proficiency}%; background: #3498db;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Education -->
      ${educations.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 7px; display: inline-block;">EDUCATION</h3>
          ${educations.slice(0, 2).map(edu => `
            <div style="margin-bottom: 10px;">
              <h4 style="margin: 0 0 3px 0; font-size: 14px; font-weight: 600;">${edu.degree} in ${edu.fieldOfStudy}</h4>
              <div style="font-size: 13px; font-weight: 500; color: #3498db; margin-bottom: 3px;">${edu.school}</div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #7f8c8d;">
                <span>${formatDate(edu.startDate)} - ${edu.currentlyStudying ? 'Present' : formatDate(edu.endDate || '')}</span>
                ${edu.grade ? `<span>GPA: ${edu.grade}</span>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Certifications -->
      ${certifications.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 7px; display: inline-block;">CERTIFICATIONS</h3>
          ${certifications.slice(0, 3).map(cert => `
            <div style="margin-bottom: 8px;">
              <h4 style="margin: 0 0 3px 0; font-size: 13px; font-weight: 600;">${cert.title}</h4>
              <div style="font-size: 12px; color: #3498db; margin-bottom: 2px;">${cert.issuer}</div>
              <div style="font-size: 11px; color: #7f8c8d;">Issued ${formatDate(cert.issueDate)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  </div>
</div>`

  // Add the div to the document
  document.body.appendChild(resumeDiv);

  try {
    // Convert the div to canvas
    const canvas = await html2canvas(resumeDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: resumeDiv.scrollHeight,
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(`${user.name.replace(/\s+/g, '_')}_Resume.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Clean up
    document.body.removeChild(resumeDiv);
  }
};
