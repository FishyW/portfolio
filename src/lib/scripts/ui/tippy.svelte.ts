import type { Plugin, Props } from 'tippy.js';
import tippyFn from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export function tippy(node: HTMLElement, fn: () => Partial<Props>) {
		$effect(() => {
			const tooltip = tippyFn(node, fn());

			return tooltip.destroy;
		});
	}


export function tooltip(node: HTMLElement, content: string) {
    $effect(() => {
			const tooltip = tippyFn(node, {content});

			return tooltip.destroy;
		});
}


export const hideOnEsc: Plugin = {
  name: 'hideOnEsc',
  defaultValue: true,
  fn({hide}) {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        hide();
      }
    }

    return {
      onShow() {
        document.addEventListener('keydown', onKeyDown);
      },
      onHide() {
        document.removeEventListener('keydown', onKeyDown);
      },
    };
  }
}