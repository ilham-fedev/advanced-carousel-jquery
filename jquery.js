$(document).ready(function () {
  // Carousel state variables
  var currentSlide = 0,
    slideNumber = $(".hero-slide").length,
    autoplayTimer,
    isAnimating = false,
    autoplayDelay = 3000;

  // Initialize carousel with first slide and thumbnail arrangement
  function initCarousel() {
    $(".hero-slide").eq(0).addClass("active");

    // Set up initial thumbnail arrangement with previous slide as first position
    var $thumbnailContainer = $("#thumbnailContainer");
    var $thumbnails = $(".thumbnail-card");
    var thumbnailsArray = $thumbnails.toArray();
    var lastIndex = thumbnailsArray.length - 1; // Previous slide index

    // Clear container and rearrange: previous slide (first position), then active slide
    $thumbnailContainer.empty();

    // Add previous slide at first position (scaled down for visual effect)
    var $lastThumb = $(thumbnailsArray[lastIndex]);
    $lastThumb.addClass("past-data");
    $thumbnailContainer.append($lastThumb);

    // Add active thumbnail (current slide)
    var $activeThumb = $(thumbnailsArray[0]);
    $activeThumb.addClass("active");
    $thumbnailContainer.append($activeThumb);

    // Add remaining thumbnails
    for (var i = 1; i < thumbnailsArray.length - 1; i++) {
      $thumbnailContainer.append(thumbnailsArray[i]);
    }

    $("#dot-0").addClass("bg-white").removeClass("bg-gray-500");
    startAutoplay();
  }

  // Navigate to specific slide with thumbnail rearrangement
  function showSlide(index) {
    // Prevent overlapping animations during transitions
    if (isAnimating) {
      return;
    }
    
    isAnimating = true;
    
    // Update main slides
    $(".hero-slide").removeClass("active");
    $(".hero-slide").eq(index).addClass("active");

    // Rearrange thumbnails: previous slide first, then active slide
    var $thumbnailContainer = $("#thumbnailContainer");
    var $thumbnails = $(".thumbnail-card");
    var $activeThumbnail = $thumbnails.eq(index);

    // Add fade effect and prevent clicks during thumbnail rearrangement
    $thumbnailContainer.css("opacity", "0.6").addClass("animating");

    setTimeout(function () {
      // Sort thumbnails by data-index to restore original order after DOM manipulation
      var thumbnailsArray = $thumbnails.toArray().sort(function (a, b) {
        return parseInt($(a).data("index"), 10) - parseInt($(b).data("index"), 10);
      });

      $thumbnailContainer.empty();

      // Create new order: previous slide, then active thumbnail, then others
      var newOrder = [];
      var prevIndex =
        (index - 1 + thumbnailsArray.length) % thumbnailsArray.length;

      // Add previous slide before active thumbnail
      newOrder.push(thumbnailsArray[prevIndex]);
      // Add active thumbnail
      newOrder.push(thumbnailsArray[index]);

      // Add other thumbnails in original order (excluding previous and active)
      for (var i = 0; i < thumbnailsArray.length; i++) {
        if (i !== index && i !== prevIndex) {
          newOrder.push(thumbnailsArray[i]);
        }
      }

      // Add thumbnails to container in new order with initial animation state
      newOrder.forEach(function (thumb, position) {
        $(thumb).css({
          opacity: "0",
          transform: "scale(0.8) translateX(20px)",
        });
        $thumbnailContainer.append(thumb);
      });

      // Update active states and previous slide styling based on position
      $(".thumbnail-card").removeClass("active past-data");
      $(".thumbnail-card").eq(0).addClass("past-data"); // First position is previous slide (scaled down)
      $(".thumbnail-card").eq(1).addClass("active"); // Second position is active slide (scaled up)

      // Animate thumbnails with staggered timing based on position
      $(".thumbnail-card").each(function (position) {
        var $thumb = $(this);
        var isPrevSlide = position === 0; // Previous slide is at position 0
        var isActive = position === 1; // Active thumbnail is at position 1

        setTimeout(function () {
          if (isPrevSlide) {
            // Previous slide animation (scaled down for visual effect)
            $thumb.css({
              opacity: "1",
              transform: "scale(1) translateX(0px)",
              transition: "all 0.5s ease-out",
            });
          } else if (isActive) {
            // Scale up animation for active thumbnail (highlighted state)
            $thumb.css({
              opacity: "1",
              transform: "scale(1.15) translateX(0px)",
              transition: "all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            });
          } else {
            // Standard animation for remaining thumbnails
            $thumb.css({
              opacity: "1",
              transform: "scale(1) translateX(0px)",
              transition: "all 0.5s ease-out",
            });
          }
        }, position * 200); // Stagger animation by 200ms per thumbnail
      });

      // Restore container opacity and enable clicks after animation
      $thumbnailContainer.css("opacity", "1").removeClass("animating");
      
      // Reset animation flag after autoplay delay to prevent rapid transitions
      setTimeout(function() {
        isAnimating = false;
      }, autoplayDelay);
    }, 150);

    // Update dots
    $('[id^="dot-"]').addClass("bg-gray-500").removeClass("bg-white");
    $("#dot-" + index)
      .addClass("bg-white")
      .removeClass("bg-gray-500");

    currentSlide = index;
  }

  // Navigate to next slide
  function nextSlide() {
    var next = (currentSlide + 1) % slideNumber;
    showSlide(next);
  }

  // Navigate to previous slide
  function prevSlide() {
    var prev = (currentSlide - 1 + slideNumber) % slideNumber;
    showSlide(prev);
  }

  // Start automatic slide progression
  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, autoplayDelay);
  }

  // Stop automatic slide progression
  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Reset autoplay timer to ensure full delay before next auto-advance
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Thumbnail click handler using event delegation for dynamic DOM changes
  $("#thumbnailContainer").on("click", ".thumbnail-card", function () {
    var index = parseInt($(this).attr("data-index"), 10);
    showSlide(index);
    resetAutoplay();
  });

  // Arrow key navigation support
  $(document).on("keydown", function (e) {
    if (e.key === "ArrowRight") {
      nextSlide();
      resetAutoplay();
    } else if (e.key === "ArrowLeft") {
      prevSlide();
      resetAutoplay();
    }
  });

  // Pause autoplay when hovering over slides
  $(".hero-slide")
    .on("mouseenter", function () {
      stopAutoplay();
    })
    .on("mouseleave", function () {
      startAutoplay();
    });

  // Pause autoplay when hovering over thumbnails (using event delegation)
  $("#thumbnailContainer")
    .on("mouseenter", ".thumbnail-card", function () {
      stopAutoplay();
    })
    .on("mouseleave", ".thumbnail-card", function () {
      startAutoplay();
    });

  // Mobile touch/swipe gesture support
  var startX = 0; // Initial touch X coordinate
  var startY = 0; // Initial touch Y coordinate

  $(".hero-slide").on("touchstart", function (e) {
    // Add error handling for touch events
    if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 0) {
      startX = e.originalEvent.touches[0].clientX;
      startY = e.originalEvent.touches[0].clientY;
    }
  });

  $(".hero-slide").on("touchend", function (e) {
    // Add error handling for touch events
    if (e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches.length > 0) {
      var endX = e.originalEvent.changedTouches[0].clientX;
      var endY = e.originalEvent.changedTouches[0].clientY;
      var deltaX = endX - startX;
      var deltaY = endY - startY;

      // Only process horizontal swipes (minimum 50px threshold)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          prevSlide(); // Swipe right = previous slide
        } else {
          nextSlide(); // Swipe left = next slide
        }
        resetAutoplay();
      }
    }
  });

  // Initialize the carousel
  initCarousel();
});
