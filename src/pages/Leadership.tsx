import { Card, CardContent } from '@/components/ui/card';
import { Users, Linkedin, Mail } from 'lucide-react';

const teamMembers = [
  {
    name: 'Faisal Al Osaimi',
    role: 'CEO',
    image: 'https://invesense.com/_next/image?url=%2Fassets%2Fimages%2FMr._Faisal_image.jpg&w=1080&q=75',
    imagePosition: 'object-center',
  },
  {
    name: 'Nawaf Al Mansour',
    role: 'CIO',
    image: 'https://invesense.com/_next/image?url=%2Fassets%2Fimages%2FIMG_2665.jpg&w=1080&q=75',
    imagePosition: 'object-[center_30%]',
  },
  {
    name: 'Mathews B Abraham',
    role: 'Chief - Finance & Operations',
    image: 'https://invesense.com/_next/image?url=%2Fassets%2Fimages%2FThis_One.jpg&w=1080&q=75',
    imagePosition: 'object-center',
  },
  {
    name: 'Ahmed Ali',
    role: 'Portfolio Manager',
    image: 'https://invesense.com/_next/image?url=%2Fassets%2Fimages%2FAhmed_Profile_Pic.jpg&w=1080&q=75',
    imagePosition: 'object-center',
  },
  {
    name: 'Ibrahim Al Shaibani',
    role: 'Portfolio Manager',
    image: 'https://invesense.com/_next/image?url=%2Fassets%2Fimages%2FIMG_2678a.jpg&w=1080&q=75',
    imagePosition: 'object-center',
  },
  {
    name: 'Tahira Muktar',
    role: 'Head of Sales',
    image: 'https://invesense.com/_next/image?url=%2Fassets%2Fimages%2FIMG_2760a_2.jpg&w=1080&q=75',
    imagePosition: 'object-center',
  },
];

export default function Leadership() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm mb-6">
              <Users className="w-4 h-4" />
              <span>Our Team</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
              Leadership
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Meet the experienced team driving innovation in Shariah-compliant investment solutions.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* Team Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card 
                key={member.name}
                className="group overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover ${member.imagePosition} transition-transform duration-700 group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium">
                      {member.role}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 bg-card/50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-primary text-sm font-medium tracking-wider uppercase mb-4">Our Mission</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">
              Guided by Principles
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Our leadership team is committed to providing transparent, reliable, and innovative 
              Shariah-compliant investment screening solutions. With decades of combined experience 
              in Islamic finance and technology, we strive to make ethical investing accessible to all.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl border border-border bg-background">
                <div className="w-14 h-14 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold text-primary">10+</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Years Experience</h4>
                <p className="text-sm text-muted-foreground">In Islamic finance and investment</p>
              </div>
              
              <div className="p-6 rounded-2xl border border-border bg-background">
                <div className="w-14 h-14 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold text-primary">50K+</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Securities Screened</h4>
                <p className="text-sm text-muted-foreground">Global coverage across markets</p>
              </div>
              
              <div className="p-6 rounded-2xl border border-border bg-background">
                <div className="w-14 h-14 rounded-xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-serif font-bold text-primary">DIFC</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Regulated</h4>
                <p className="text-sm text-muted-foreground">DFSA regulated in Dubai</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
