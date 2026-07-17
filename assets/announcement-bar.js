import { Component } from "@theme/component";

/**
 * Creates a continuous, width-aware loop from the announcement blocks.
 * Copies are added at runtime so short and long messages both fill the viewport
 * without leaving an empty space in the animation.
 */
export class AnnouncementBar extends Component {
  /** @type {ResizeObserver | undefined} */
  #resizeObserver;

  /** @type {number | undefined} */
  #resizeFrame;

  connectedCallback() {
    super.connectedCallback();
    this.#buildMarquee();

    this.#resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(this.#resizeFrame);
      this.#resizeFrame = requestAnimationFrame(() => this.#buildMarquee());
    });
    this.#resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#resizeObserver?.disconnect();
    cancelAnimationFrame(this.#resizeFrame);
  }

  #buildMarquee() {
    const track = this.querySelector(".announcement-bar__track");
    const group = track?.querySelector(".announcement-bar__group");
    if (!(track instanceof HTMLElement) || !(group instanceof HTMLElement))
      return;

    track
      .querySelectorAll('.announcement-bar__group[aria-hidden="true"]')
      .forEach((copy) => copy.remove());
    group
      .querySelectorAll("[data-announcement-copy]")
      .forEach((copy) => copy.remove());

    const announcements = Array.from(group.children);
    if (announcements.length === 0) return;

    // Make one group wider than the viewport, then animate to its identical twin.
    let index = 0;
    while (group.scrollWidth < this.clientWidth + 1) {
      const copy = announcements[index % announcements.length].cloneNode(true);
      if (!(copy instanceof HTMLElement)) break;
      copy.dataset.announcementCopy = "";
      copy.setAttribute("aria-hidden", "true");
      group.appendChild(copy);
      index += 1;
    }

    const secondGroup = group.cloneNode(true);
    if (!(secondGroup instanceof HTMLElement)) return;
    secondGroup.setAttribute("aria-hidden", "true");
    secondGroup
      .querySelectorAll("[id]")
      .forEach((element) => element.removeAttribute("id"));
    track.appendChild(secondGroup);

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const distance = group.getBoundingClientRect().width + gap;
    const speedSetting = Number.parseFloat(getComputedStyle(this).getPropertyValue("--announcement-speed")) || 8;
    const pixelsPerSecond = speedSetting * 10;

    track.style.setProperty(
      "--announcement-distance",
      `${distance}px`,
    );
    track.style.setProperty("--announcement-duration", `${distance / pixelsPerSecond}s`);
  }
}

if (!customElements.get("announcement-bar-component")) {
  customElements.define("announcement-bar-component", AnnouncementBar);
}
