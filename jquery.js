$(document).ready(function () {
  var currentSlide = 0,
    slideNumber = $(".hero-slide").length,
    autoplayTimer;

  // Initialize carousel
  function initCarousel() {
    $(".hero-slide").eq(0).addClass("active");

    // Set up initial thumbnail arrangement with last data as past data
    var $thumbnailContainer = $("#thumbnailContainer");
    var $thumbnails = $(".thumbnail-card");
    var thumbnailsArray = $thumbnails.toArray();
    var lastIndex = thumbnailsArray.length - 1; // Last data index

    // Clear container and rearrange: last data (half-cut), then active (first)
    $thumbnailContainer.empty();

    // Add last data as past data (half-cut)
    var $lastThumb = $(thumbnailsArray[lastIndex]);
    $lastThumb.addClass("past-data");
    $thumbnailContainer.append($lastThumb);

    // Add active thumbnail (first data)
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

  // Show specific slide
  function showSlide(index) {
    // Update main slides
    $(".hero-slide").removeClass("active");
    $(".hero-slide").eq(index).addClass("active");

    // Rearrange thumbnails to put active one first
    var $thumbnailContainer = $("#thumbnailContainer");
    var $thumbnails = $(".thumbnail-card");
    var $activeThumbnail = $thumbnails.eq(index);

    // Add fade effect and prevent clicks during animation
    $thumbnailContainer.css("opacity", "0.6").addClass("animating");

    setTimeout(function () {
      // Get all thumbnails and sort them by data-index to handle DOM reordering
      var thumbnailsArray = $thumbnails.toArray().sort(function (a, b) {
        return parseInt($(a).data("index")) - parseInt($(b).data("index"));
      });

      $thumbnailContainer.empty();

      // Create new order: last data, then active thumbnail, then others
      var newOrder = [];
      var lastIndex =
        (index - 1 + thumbnailsArray.length) % thumbnailsArray.length;

      // Add last data before active thumbnail
      newOrder.push(thumbnailsArray[lastIndex]);
      // Add active thumbnail
      newOrder.push(thumbnailsArray[index]);

      // Add other thumbnails in original order (excluding last and active)
      for (var i = 0; i < thumbnailsArray.length; i++) {
        if (i !== index && i !== lastIndex) {
          newOrder.push(thumbnailsArray[i]);
        }
      }

      // Add thumbnails back to container in new order with initial hidden state
      newOrder.forEach(function (thumb, position) {
        $(thumb).css({
          opacity: "0",
          transform: "scale(0.8) translateX(20px)",
        });
        $thumbnailContainer.append(thumb);
      });

      // Update active states and past data based on data-index, not position
      $(".thumbnail-card").removeClass("active past-data");
      $(".thumbnail-card").eq(0).addClass("past-data"); // First position is past data (half-cut)
      $(".thumbnail-card").eq(1).addClass("active"); // Second position is now active (after past data)

      // Animate thumbnails in sequence
      $(".thumbnail-card").each(function (position) {
        var $thumb = $(this);
        var isPastData = position === 0; // Past data is at position 0
        var isActive = position === 1; // Active thumbnail is at position 1

        setTimeout(function () {
          if (isPastData) {
            // Past data animation (half-cut)
            $thumb.css({
              opacity: "1",
              transform: "scale(1) translateX(0px)",
              transition: "all 0.5s ease-out",
            });
          } else if (isActive) {
            // Zoom in animation for active thumbnail
            $thumb.css({
              opacity: "1",
              transform: "scale(1.15) translateX(0px)",
              transition: "all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            });
          } else {
            // Scroll in animation for other thumbnails
            $thumb.css({
              opacity: "1",
              transform: "scale(1) translateX(0px)",
              transition: "all 0.5s ease-out",
            });
          }
        }, position * 200); // Stagger animation
      });

      // Fade back in container and enable clicks
      $thumbnailContainer.css("opacity", "1").removeClass("animating");
    }, 150);

    // Update dots
    $('[id^="dot-"]').addClass("bg-gray-500").removeClass("bg-white");
    $("#dot-" + index)
      .addClass("bg-white")
      .removeClass("bg-gray-500");

    currentSlide = index;
  }

  // Next slide
  function nextSlide() {
    var next = (currentSlide + 1) % slideNumber;
    showSlide(next);
  }

  // Previous slide
  function prevSlide() {
    var prev = (currentSlide - 1 + slideNumber) % slideNumber;
    showSlide(prev);
  }

  // Start autoplay
  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, 3000);
  }

  // Stop autoplay
  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  // Reset autoplay
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Event handlers using delegation for dynamically rearranged thumbnails
  $("#thumbnailContainer").on("click", ".thumbnail-card", function () {
    var index = parseInt($(this).attr("data-index"));
    showSlide(index);
    resetAutoplay();
  });

  // Keyboard navigation
  $(document).on("keydown", function (e) {
    if (e.key === "ArrowRight") {
      nextSlide();
      resetAutoplay();
    } else if (e.key === "ArrowLeft") {
      prevSlide();
      resetAutoplay();
    }
  });

  // Pause autoplay on hover
  $(".hero-slide")
    .on("mouseenter", function () {
      stopAutoplay();
    })
    .on("mouseleave", function () {
      startAutoplay();
    });

  // Use delegation for thumbnail hover events
  $("#thumbnailContainer")
    .on("mouseenter", ".thumbnail-card", function () {
      stopAutoplay();
    })
    .on("mouseleave", ".thumbnail-card", function () {
      startAutoplay();
    });

  // Touch/swipe support for mobile
  var startX = 0;
  var startY = 0;

  $(".hero-slide").on("touchstart", function (e) {
    startX = e.originalEvent.touches[0].clientX;
    startY = e.originalEvent.touches[0].clientY;
  });

  $(".hero-slide").on("touchend", function (e) {
    var endX = e.originalEvent.changedTouches[0].clientX;
    var endY = e.originalEvent.changedTouches[0].clientY;
    var deltaX = endX - startX;
    var deltaY = endY - startY;

    // Only process horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      resetAutoplay();
    }
  });

  // Initialize the carousel
  initCarousel();
});
