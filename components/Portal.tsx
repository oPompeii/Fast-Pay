import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

const Portal: React.FC<PortalProps> = ({ 
  children, 
  containerId = 'portal-root' 
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Create portal container if it doesn't exist
    let portalContainer = document.getElementById(containerId);
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.setAttribute('id', containerId);
      document.body.appendChild(portalContainer);
    }

    return () => {
      // Clean up empty portal container
      portalContainer = document.getElementById(containerId);
      if (portalContainer && !portalContainer.hasChildNodes()) {
        portalContainer.remove();
      }
    };
  }, [containerId]);

  if (!mounted) return null;

  const portalRoot = document.getElementById(containerId);
  if (!portalRoot) return null;

  return createPortal(children, portalRoot);
};

export default Portal;