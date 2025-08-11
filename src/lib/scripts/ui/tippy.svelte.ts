import type { Attachment } from 'svelte/attachments';
import type { Plugin, Props } from 'tippy.js';
import tippyFn from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export function tippy(node: HTMLElement, fn: () => Partial<Props>) {
		$effect(() => {
			const tooltip = tippyFn(node, fn());

			return tooltip.destroy;
		});
	}


export function tooltip(content: string, showFront = false, props: Partial<Props> = {}): Attachment {
  return (node) => {
      const tooltip = tippyFn(node, 
          {
            content, 
            appendTo: document.body,
            zIndex: !showFront ? 0 : 9999,
            ...props
          });

			return tooltip.destroy;
  }
			
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