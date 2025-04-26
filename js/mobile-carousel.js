// 定义IntersectionObserver的配置选项
const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.1,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      const section = entry.target.closest(".section");
      if (section) {
        const bg = section.querySelector(".parallax-bg");
        if (bg) {
          bg.style.opacity = entry.intersectionRatio.toString();
          bg.classList.add("active");
        }
      }
    } else {
      const section = entry.target.closest(".section");
      if (section) {
        const bg = section.querySelector(".parallax-bg");
        if (bg) {
          bg.style.opacity = "0";
          bg.classList.remove("active");
        }
      }
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach((element) => {
  observer.observe(element);
});

// 优化的视差滚动效果
let lastScrollTop = 0;
const parallaxElements = document.querySelectorAll(".parallax-bg");

function handleParallax() {
  const scrolled = window.pageYOffset;
  const delta = scrolled - lastScrollTop;
  lastScrollTop = scrolled;

  parallaxElements.forEach((bg) => {
    const section = bg.closest(".section");
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (inView) {
      const speed = 0.4;
      const yPos = rect.top * speed;
      const scale = 1 + Math.abs(rect.top) / (window.innerHeight * 4);
      bg.style.transform = `translate3d(0, ${yPos}px, 0) scale(${scale})`;
      const opacity = Math.max(
        0,
        Math.min(1, 1 - Math.abs(rect.top) / (window.innerHeight * 0.8))
      );
      bg.style.opacity = opacity;
    }
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleParallax();
      ticking = false;
    });
    ticking = true;
  }
});

handleParallax();

// 导航栏控制
function toggleNav() {
  document.querySelector("nav").classList.toggle("active");
}

document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector("nav").classList.remove("active");
  });
});

document.addEventListener("click", (e) => {
  const nav = document.querySelector("nav");
  const navToggle = document.querySelector(".nav-toggle");
  if (
    nav.classList.contains("active") &&
    !e.target.closest("nav") &&
    !e.target.closest(".nav-toggle")
  ) {
    nav.classList.remove("active");
  }
});

// 通用轮播图控制函数
function initCarousel(
  containerSelector,
  slideSelector,
  indicatorSelector,
  interval = 3000
) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const slides = container.querySelectorAll(slideSelector);
  const indicators = container.querySelectorAll(indicatorSelector);
  let currentSlide = 0;
  let intervalId;
  let touchStartX = 0;
  let touchEndX = 0;
  let isSwiping = false;

  // 初始化显示第一张图片
  if (slides.length > 0) {
    slides[0].classList.add("active");
    if (indicators.length > 0) {
      indicators[0].classList.add("active");
    }
  }

  // 切换到指定幻灯片
  function goToSlide(index) {
    if (slides.length === 0) return;

    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    slides[currentSlide].classList.remove("active");
    if (indicators.length > 0) {
      indicators[currentSlide].classList.remove("active");
    }

    currentSlide = index;

    slides[currentSlide].classList.add("active");
    if (indicators.length > 0) {
      indicators[currentSlide].classList.add("active");
    }
  }

  // 自动轮播
  function startInterval() {
    if (slides.length <= 1) return;

    intervalId = setInterval(() => {
      if (!isSwiping) {
        goToSlide((currentSlide + 1) % slides.length);
      }
    }, interval);
  }

  function resetInterval() {
    clearInterval(intervalId);
    startInterval();
  }

  // 触摸事件处理
  container.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      isSwiping = true;
      clearInterval(intervalId);
    },
    { passive: true }
  );

  container.addEventListener(
    "touchmove",
    (e) => {
      if (!isSwiping) return;
      touchEndX = e.touches[0].clientX;
      const diff = touchEndX - touchStartX;

      if (Math.abs(diff) > 20) {
        e.preventDefault();
      }
    },
    { passive: false }
  );

  container.addEventListener("touchend", (e) => {
    if (!isSwiping) return;

    touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(currentSlide - 1);
      } else {
        goToSlide(currentSlide + 1);
      }
    }

    isSwiping = false;
    startInterval();
  });

  // 指示器点击事件
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      if (currentSlide !== index) {
        goToSlide(index);
        resetInterval();
      }
    });
  });

  // 开始自动轮播
  startInterval();

  // 页面可见性变化处理
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(intervalId);
    } else {
      startInterval();
    }
  });

  // 窗口失去焦点时暂停
  window.addEventListener("blur", () => {
    clearInterval(intervalId);
  });

  // 窗口获得焦点时恢复
  window.addEventListener("focus", () => {
    startInterval();
  });

  // 返回清理函数
  return function cleanup() {
    clearInterval(intervalId);
    container.removeEventListener("touchstart", null);
    container.removeEventListener("touchmove", null);
    container.removeEventListener("touchend", null);
  };
}

// 页面加载完成后初始化所有轮播图
document.addEventListener("DOMContentLoaded", function () {
  // 初始化首页轮播图
  initCarousel(".carousel-container", ".box-li", ".indicator");

  // 初始化各个系列轮播图
  initCarousel("#sanhu-box", "img", "#sanhu-btns button");
  initCarousel("#wuyi-box", "img", "#wuyi-btns button");
  initCarousel("#yun-box", "img", "#yun-btns button");
  initCarousel("#biao-box", "img", "#biao-btns button");
});
