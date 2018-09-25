const innerTextTracker = domElement => {
  // Stores resolve and reject methods from promises.
  let resolver;
  let rejecter;

  // Text to match.
  let innerTextToMatch;

  // Initializes the observer.
  const observer = new window.MutationObserver(
    // Uses requestAnimationFrame to avoid reflows when accessing innerText
    () =>
      window.requestAnimationFrame(
        () => domElement.innerText === innerTextToMatch && resolver(),
      ),
  );
  observer.observe(domElement, { childList: true });

  // Returns an async function that ends when the innerText attribute of
  // the domElement matches the one passed as argument.
  return async innerText => {
    // Rejects a pending Promise
    if (rejecter) {
      // rejecter();
      rejecter = null;
    }

    // Checks first if innerText is already the same.
    const isInnerTextEqual = await new Promise(resolve => {
      window.requestAnimationFrame(() => {
        resolve(innerText === domElement.innerText);
      });
    });

    if (isInnerTextEqual) return;

    // Sets innerText to match.
    innerTextToMatch = innerText;

    // Resolves when the the innerText of the observed element is equals to
    // innerTextToMatch.
    await new Promise((resolve, reject) => {
      resolver = resolve;
      rejecter = reject;
    });
  };
};

export default {
  innerTextTracker,
};
