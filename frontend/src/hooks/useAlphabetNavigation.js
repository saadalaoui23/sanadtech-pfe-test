import { useState, useCallback } from 'react';

const useAlphabetNavigation = () => {
  const [activeLetter, setActiveLetter] = useState(null);

  const handleLetterClick = useCallback((letter) => {
    setActiveLetter(letter);
    // Scroll to top when letter changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { activeLetter, handleLetterClick };
};

export default useAlphabetNavigation;
