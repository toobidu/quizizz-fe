import React from "react";
import "../styles/components/Decoration.css";

const Decoration = () => (
  <div className="dcr-hero-decoration">
    {/* Floating Shapes */}
    <div className="dcr-floating-shape shape-1"></div>
    <div className="dcr-floating-shape shape-2"></div>
    <div className="dcr-floating-shape shape-3"></div>
    <div className="dcr-floating-shape shape-4"></div>
    
    {/* Rotating Rings */}
    <div className="dcr-rotating-ring ring-1"></div>
    <div className="dcr-rotating-ring ring-2"></div>
    
    {/* Pulse Dots */}
    <div className="dcr-pulse-dot dot-1"></div>
    <div className="dcr-pulse-dot dot-2"></div>
    <div className="dcr-pulse-dot dot-3"></div>
    
    {/* Moving Lines */}
    <div className="dcr-moving-line line-1"></div>
    <div className="dcr-moving-line line-2"></div>
    
    {/* Morphing Shapes */}
    <div className="dcr-morph-shape morph-1"></div>
    <div className="dcr-morph-shape morph-2"></div>
    
    {/* Particles */}
    <div className="dcr-particle-container">
      {[...Array(12)].map((_, i) => (
        <div key={i} className={`dcr-particle particle-${i + 1}`}></div>
      ))}
    </div>
    
    {/* Gradient Orbs */}
    <div className="dcr-gradient-orb orb-1"></div>
    <div className="dcr-gradient-orb orb-2"></div>
    <div className="dcr-gradient-orb orb-3"></div>
    
    {/* Border Elements */}
    <div className="dcr-border-element border-top"></div>
    <div className="dcr-border-element border-right"></div>
    <div className="dcr-border-element border-bottom"></div>
    <div className="dcr-border-element border-left"></div>
    
    {/* Corner Decorations */}
    <div className="dcr-corner-decoration corner-tl"></div>
    <div className="dcr-corner-decoration corner-tr"></div>
    <div className="dcr-corner-decoration corner-bl"></div>
    <div className="dcr-corner-decoration corner-br"></div>
    
    {/* Edge Particles */}
    <div className="dcr-edge-particles">
      {[...Array(20)].map((_, i) => (
        <div key={i} className={`dcr-edge-particle edge-particle-${i + 1}`}></div>
      ))}
    </div>
    
    {/* Flowing Lines */}
    <div className="dcr-flowing-line flow-top"></div>
    <div className="dcr-flowing-line flow-right"></div>
    <div className="dcr-flowing-line flow-bottom"></div>
    <div className="dcr-flowing-line flow-left"></div>
    
    {/* Spiral Elements */}
    <div className="dcr-spiral spiral-1"></div>
    <div className="dcr-spiral spiral-2"></div>
    <div className="dcr-spiral spiral-3"></div>
    <div className="dcr-spiral spiral-4"></div>
    
    {/* Wave Elements */}
    <div className="dcr-wave wave-top"></div>
    <div className="dcr-wave wave-bottom"></div>
    
    {/* Scattered Dots */}
    <div className="dcr-scattered-dots">
      {[...Array(30)].map((_, i) => (
        <div key={i} className={`dcr-scattered-dot scattered-dot-${i + 1}`}></div>
      ))}
    </div>
    
    {/* Energy Beams */}
    <div className="dcr-energy-beam beam-1"></div>
    <div className="dcr-energy-beam beam-2"></div>
    <div className="dcr-energy-beam beam-3"></div>
    <div className="dcr-energy-beam beam-4"></div>
  </div>
);

export default Decoration;