import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

const INPUT_SELECTOR = "ion-input, ion-textarea, ion-searchbar, input, textarea";
const SCROLL_DELAY_MS = 280;

const scrollFocusedFieldIntoView = () => {
  const activeElement = document.activeElement;

  if (!activeElement?.matches(INPUT_SELECTOR)) {
    return;
  }

  const target =
    activeElement.closest("ion-item, .form-field, .input-item") || activeElement;

  target.scrollIntoView({
    block: "center",
    inline: "nearest",
    behavior: "smooth",
  });
};

export const useKeyboardViewport = () => {
  useEffect(() => {
    let focusTimer: number | undefined;

    const scheduleScroll = () => {
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(scrollFocusedFieldIntoView, SCROLL_DELAY_MS);
    };

    document.addEventListener("focusin", scheduleScroll);

    if (!Capacitor.isNativePlatform()) {
      return () => {
        window.clearTimeout(focusTimer);
        document.removeEventListener("focusin", scheduleScroll);
      };
    }

    let disposed = false;
    const keyboardListeners = [
      Keyboard.addListener("keyboardWillShow", (info) => {
        document.body.classList.add("keyboard-is-open");
        document.documentElement.style.setProperty(
          "--app-keyboard-height",
          `${info.keyboardHeight}px`
        );
        scheduleScroll();
      }),
      Keyboard.addListener("keyboardDidShow", scheduleScroll),
      Keyboard.addListener("keyboardWillHide", () => {
        document.body.classList.remove("keyboard-is-open");
        document.documentElement.style.removeProperty("--app-keyboard-height");
      }),
    ];

    return () => {
      disposed = true;
      window.clearTimeout(focusTimer);
      document.removeEventListener("focusin", scheduleScroll);
      document.body.classList.remove("keyboard-is-open");
      document.documentElement.style.removeProperty("--app-keyboard-height");

      keyboardListeners.forEach((listenerPromise) => {
        listenerPromise.then((listener) => {
          if (disposed) {
            listener.remove();
          }
        });
      });
    };
  }, []);
};
