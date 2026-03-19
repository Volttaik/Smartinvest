import { TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const footerLinks = {
  Company: ["About Us", "Leadership", "Careers", "Press"],
  Services: ["Equity Portfolios", "Fixed Income", "Global Markets", "Wealth Planning"],
  Resources: ["Market Insights", "Investment Guide", "FAQ", "Blog"],
  Legal: ["Privacy Policy", "Terms of Service", "Disclosures", "Cookies"],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold font-display text-lg text-foreground">
                Smart Invest<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
              Institutional-grade investment strategies for the modern investor.
            </p>
          </div>

          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <div className="text-xs font-bold uppercase tracking-widest text-foreground mb-4">{cat}</div>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-xs text-muted-foreground">
            © 2024 Smart Invest, Inc. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Investment involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
