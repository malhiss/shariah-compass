import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/AnimatedSection';
import { motion } from 'framer-motion';

// Import team images
import faisalImg from '@/assets/team/faisal-al-osaimi.png';
import nawafImg from '@/assets/team/nawaf-al-mansour.png';
import mathewsImg from '@/assets/team/mathews-b-abraham.png';
import ahmedImg from '@/assets/team/ahmed-ali.png';
import ibrahimImg from '@/assets/team/ibrahim-al-shaibani.png';

const teamMembers = [
  {
    name: 'Faisal Al Osaimi',
    role: 'CEO',
    image: faisalImg,
    bio: 'Faisal is a certified portfolio and wealth manager with some 18 years\' diverse experience; as a trader, dealer, and senior executive manager of KFIC Asset Management. He emphasizes diversity, portfolio efficiency, and results-driven strategy.',
  },
  {
    name: 'Nawaf Al Mansour',
    role: 'CIO',
    image: nawafImg,
    bio: 'Chartered Financial Analyst with 20 years of experience, Nawaf managed billions at Kuwait Investment Authority and believes in disciplined, diversified, and cost-conscious portfolio construction.',
  },
  {
    name: 'Mathews B Abraham',
    role: 'Chief - Finance & Operations',
    image: mathewsImg,
    bio: 'Mathews, a CIPM holder with 23+ years of experience, supports Invesense with risk analysis, financial reporting, and market tracking. Formerly Vice President at MARKAZ.',
  },
  {
    name: 'Ahmed Ali',
    role: 'Portfolio Manager',
    image: ahmedImg,
    bio: 'A former Morgan Stanley intern and KIA graduate, Ahmed applies global and regional portfolio experience to help clients build stable wealth through educated decisions.',
  },
  {
    name: 'Ibrahim Al Shaibani',
    role: 'Portfolio Manager',
    image: ibrahimImg,
    bio: 'Ibrahim, a former intern at Kuwait Investment Office London, has global multi-asset experience and takes a scientific, steady approach to portfolio management.',
  },
  {
    name: 'Tahira Muktar',
    role: 'Head of Sales',
    image: 'https://invesense.com/_next/image?url=%2Fassets%2Fimages%2FIMG_2760a_2.jpg&w=1080&q=75',
    bio: 'With 16+ years of experience, Tahira worked with Dimensional Fund Advisors and Nobel Laureates to develop client relations and business in the Middle East.',
  },
];

export default function Leadership() {
  return (
    <div>
      {/* Hero Section - Dark slate like Invesense */}
      <section className="relative py-24 md:py-32 overflow-hidden snap-start snap-always min-h-[50vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <motion.h1 
              className="text-4xl md:text-6xl font-serif font-light text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Leadership
            </motion.h1>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* Team Grid - White background like Invesense */}
      <section className="py-16 md:py-24 section-light snap-start snap-always">
        <div className="container">
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member) => (
              <StaggerItem key={member.name}>
                <motion.div 
                  className="leadership-card bg-white"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Image */}
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="p-5 bg-white">
                    <h3 className="font-serif text-xl font-semibold text-slate-700 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary text-sm font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 snap-start snap-always">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Our Mission</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light mb-8 text-foreground">
                Guided by Principles
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our leadership team is committed to providing transparent, reliable, and innovative 
                Shariah-compliant investment screening solutions. With decades of combined experience 
                in Islamic finance and technology, we strive to make ethical investing accessible to all.
              </p>
            </AnimatedSection>
            
            <StaggerContainer className="grid md:grid-cols-3 gap-8">
              <StaggerItem>
                <motion.div 
                  className="premium-card p-6 rounded-lg text-center min-h-[160px] flex flex-col justify-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-14 h-14 rounded-lg bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-serif font-bold text-primary">10+</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Years Experience</h4>
                  <p className="text-sm text-muted-foreground">In Islamic finance and investment</p>
                </motion.div>
              </StaggerItem>
              
              <StaggerItem>
                <motion.div 
                  className="premium-card p-6 rounded-lg text-center min-h-[160px] flex flex-col justify-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-14 h-14 rounded-lg bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-serif font-bold text-primary">50K+</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Securities Screened</h4>
                  <p className="text-sm text-muted-foreground">Global coverage across markets</p>
                </motion.div>
              </StaggerItem>
              
              <StaggerItem>
                <motion.div 
                  className="premium-card p-6 rounded-lg text-center min-h-[160px] flex flex-col justify-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-14 h-14 rounded-lg bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-serif font-bold text-primary">DIFC</span>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">Regulated</h4>
                  <p className="text-sm text-muted-foreground">DFSA regulated in Dubai</p>
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </div>
      </section>
    </div>
  );
}