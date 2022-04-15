interface ExtendedNavigator extends Navigator {
  brave?: {
    isBrave?: {
      name?: string;
    };
  };
}

export function isBrave() {
  const navigator = window.navigator as ExtendedNavigator;
  if (navigator.brave != undefined) {
    if (navigator.brave?.isBrave?.name == 'isBrave') {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
