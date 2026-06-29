(() => {
  const SELECTORS = {
    root: '[data-review-pagination]',
    card: '[data-review-card]',
    pageButton: '[data-review-page-button]',
    previous: '[data-review-pagination-previous]',
    next: '[data-review-pagination-next]',
    pageList: '[data-review-page-list]',
  };

  const ACTIVE_CLASS = 'dv-reviews__pagination-button--active';
  const HIDDEN_CLASS = 'dv-reviews__card--hidden';

  class ReviewsPagination {
    constructor(root) {
      this.root = root;
      this.cards = Array.from(root.querySelectorAll(SELECTORS.card));
      this.pageList = root.querySelector(SELECTORS.pageList);
      this.pageButtons = Array.from(root.querySelectorAll(SELECTORS.pageButton));
      this.previousButton = root.querySelector(SELECTORS.previous);
      this.nextButton = root.querySelector(SELECTORS.next);
      this.totalPages = Number(root.dataset.reviewTotalPages) || this.getTotalPages();
      this.activePage = Number(root.dataset.reviewActivePage) || 1;

      this.renderPageLabels();
      this.bindEvents();
      this.goToPage(this.activePage);
    }

    getTotalPages() {
      return this.cards.reduce((maxPage, card) => {
        const cardPage = Number(card.dataset.page) || 1;
        return Math.max(maxPage, cardPage);
      }, 1);
    }

    bindEvents() {
      if (this.pageList) {
        this.pageList.addEventListener('click', (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;

          const button = target.closest(SELECTORS.pageButton);
          if (!button) return;

          const page = Number(button.dataset.reviewPageButton);
          if (page) this.goToPage(page);
        });
      }

      if (this.previousButton) {
        this.previousButton.addEventListener('click', () => this.goToPage(this.activePage - 1));
      }

      if (this.nextButton) {
        this.nextButton.addEventListener('click', () => this.goToPage(this.activePage + 1));
      }
    }

    getVisiblePages() {
      if (this.totalPages <= 5) {
        return Array.from({ length: this.totalPages }, (_, index) => index + 1);
      }

      if (this.activePage <= 3) {
        return [1, 2, 3, 'ellipsis', this.totalPages];
      }

      if (this.activePage >= this.totalPages - 2) {
        return [1, 'ellipsis', this.totalPages - 2, this.totalPages - 1, this.totalPages];
      }

      return [1, 'ellipsis-start', this.activePage, 'ellipsis-end', this.totalPages];
    }

    renderPageLabels() {
      if (!this.pageList) return;

      const fragment = document.createDocumentFragment();

      this.getVisiblePages().forEach((item) => {
        if (typeof item === 'string') {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'dv-reviews__pagination-ellipsis';
          ellipsis.setAttribute('aria-hidden', 'true');
          ellipsis.textContent = '…';
          fragment.append(ellipsis);
          return;
        }

        const button = document.createElement('button');
        button.className = 'dv-reviews__pagination-button';
        button.type = 'button';
        button.dataset.reviewPageButton = String(item);
        button.setAttribute('aria-label', `Reviews page ${item}`);
        button.textContent = String(item);
        fragment.append(button);
      });

      this.pageList.replaceChildren(fragment);
      this.pageButtons = Array.from(this.pageList.querySelectorAll(SELECTORS.pageButton));
    }

    goToPage(page) {
      const nextPage = Math.min(Math.max(page, 1), this.totalPages);
      this.activePage = nextPage;
      this.root.dataset.reviewActivePage = String(nextPage);
      this.renderPageLabels();

      this.cards.forEach((card) => {
        const isVisible = Number(card.dataset.page) === nextPage;
        card.hidden = !isVisible;
        card.classList.toggle(HIDDEN_CLASS, !isVisible);
      });

      this.pageButtons.forEach((button) => {
        const isActive = Number(button.dataset.reviewPageButton) === nextPage;
        button.classList.toggle(ACTIVE_CLASS, isActive);
        button.setAttribute('aria-current', isActive ? 'page' : 'false');
      });

      if (this.previousButton) {
        this.previousButton.disabled = nextPage === 1;
      }

      if (this.nextButton) {
        this.nextButton.disabled = nextPage === this.totalPages;
      }
    }
  }

  const init = () => {
    document.querySelectorAll(SELECTORS.root).forEach((root) => {
      if (root.dataset.reviewPaginationInitialized === 'true') return;
      root.dataset.reviewPaginationInitialized = 'true';
      new ReviewsPagination(root);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', init);
})();
