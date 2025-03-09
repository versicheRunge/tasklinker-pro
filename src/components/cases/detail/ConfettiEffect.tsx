
import React from 'react';

export const showConfetti = () => {
  // Create confetti element
  const confettiContainer = document.createElement('div');
  confettiContainer.style.position = 'fixed';
  confettiContainer.style.top = '0';
  confettiContainer.style.left = '0';
  confettiContainer.style.width = '100%';
  confettiContainer.style.height = '100%';
  confettiContainer.style.zIndex = '9999';
  confettiContainer.style.pointerEvents = 'none';
  document.body.appendChild(confettiContainer);

  // Create confetti pieces
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'absolute';
    confetti.style.width = `${Math.random() * 10 + 5}px`;
    confetti.style.height = `${Math.random() * 10 + 5}px`;
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.borderRadius = '50%';
    confetti.style.top = '0';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.transform = 'translateY(-100%)';
    confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
    confettiContainer.appendChild(confetti);
  }

  // Create congrats message
  const congratsMsg = document.createElement('div');
  congratsMsg.style.position = 'fixed';
  congratsMsg.style.top = '50%';
  congratsMsg.style.left = '50%';
  congratsMsg.style.transform = 'translate(-50%, -50%)';
  congratsMsg.style.background = 'white';
  congratsMsg.style.padding = '2rem';
  congratsMsg.style.borderRadius = '0.5rem';
  congratsMsg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
  congratsMsg.style.zIndex = '10000';
  congratsMsg.style.textAlign = 'center';
  congratsMsg.innerHTML = `
    <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Glückwunsch!</h3>
    <p style="margin-bottom: 1.5rem;">Alle Vorgänge wurden erfolgreich abgeschlossen.</p>
    <button id="confetti-close" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">Schließen</button>
  `;
  document.body.appendChild(congratsMsg);

  // Add animation styles
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fall {
      to {
        transform: translateY(100vh) rotate(360deg);
      }
    }
  `;
  document.head.appendChild(style);

  // Add event listener to close button
  document.getElementById('confetti-close')?.addEventListener('click', () => {
    document.body.removeChild(confettiContainer);
    document.body.removeChild(congratsMsg);
    document.head.removeChild(style);
  });

  // Auto-remove after 7 seconds
  setTimeout(() => {
    if (document.body.contains(confettiContainer)) {
      document.body.removeChild(confettiContainer);
    }
    if (document.body.contains(congratsMsg)) {
      document.body.removeChild(congratsMsg);
    }
    if (document.head.contains(style)) {
      document.head.removeChild(style);
    }
  }, 7000);
};
