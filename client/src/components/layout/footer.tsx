import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import { useLanguageContext } from "@/hooks/useLanguageContext";

export default function Footer() {
  const { t } = useLanguageContext();
  
  return (
    <footer className="bg-muted/50 border-t border-border text-foreground py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-sans text-lg font-semibold">LearnFlow</h3>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t.footer.description}
            </p>
            {/* From Uiverse.io by Ashe-T */}
            <section className="flex justify-start items-center">
              <a
                href="https://github.com/t2-astra"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex justify-center p-2 rounded-md drop-shadow-xl bg-gradient-to-r from-gray-800 to-black text-white font-semibold hover:translate-y-3 transition-all duration-500 hover:from-[#331029] hover:to-[#310413]"
              >
                <svg
                  className="w-5"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span
                  className="absolute opacity-0 group-hover:opacity-100 group-hover:text-gray-700 group-hover:text-sm group-hover:-translate-y-10 duration-700"
                >
                  GitHub
                </span>
              </a>
            </section>
          </div>
          
          <div>
            <h4 className="font-sans text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search" data-testid="footer-link-search">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">
                    Search Resources
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/search?type=question-papers" data-testid="footer-link-papers">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">
                    Question Papers
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/search?type=notes" data-testid="footer-link-notes">
                  <span className="text-muted-foreground hover:text-foreground transition-colors">
                    Study Notes
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-sans text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-help">Help Center</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-contact">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-report">Report Issue</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-link-feedback">Feedback</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
  