import React, { useState } from 'react';
import {
  chakra,
  keyframes,
  ImageProps,
  forwardRef,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import logo from './everlab-logo.svg';
import logoWithName from './everlab-logo-with-name.svg';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const Logo = forwardRef<ImageProps, 'img'>((props, ref) => {
  const [duration, setDuration] = useState(20);
  const [flipped, setFlipped] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const animation = prefersReducedMotion
    ? undefined
    : `${spin} infinite ${duration}s linear`;

  return (
    <chakra.img
      animation={animation}
      src={logo}
      ref={ref}
      {...props}
      onClick={() => {
        if (duration <= 0) {
          setFlipped(!flipped);
        } else if (duration >= 40) {
          setFlipped(!flipped);
        }
        setDuration(duration + (flipped ? 1 : -1));
      }}
    />
  );
});

export const LogoWithName = forwardRef<ImageProps, 'img'>((props, ref) => (
  <chakra.img src={logoWithName} ref={ref} {...props} />
));
