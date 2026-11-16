import { useEffect, useMemo, useState } from "react";
import { authApi, AuthApiError, type AuthUser } from "../lib/auth";
import {
  commerceApi,
  CommerceApiError,
  formatCoursePrice,
  loadRazorpay,
  type CheckoutQuote,
  type CommerceCourse,
} from "../lib/commerce";
import { Icon } from "./SiteIcon";

type Navigate = (to: string) => void;

function CoursePrice({ course }: { course: CommerceCourse }) {
  return (
    <div className="course-pricing">
      {course.price_available ? (
        <>
          <strong>{formatCoursePrice(course.price, course.currency)}</strong>
          {course.list_price && course.price && Number(course.list_price) > Number(course.price) && (
            <span className="course-price-discount">
              <s>{formatCoursePrice(course.list_price, course.currency)}</s>
              <small>Save {course.discount_percent}%</small>
            </span>
          )}
        </>
      ) : (
        <strong className="price-unavailable">Price currently unavailable</strong>
      )}
    </div>
  );
}

export function CourseDetailPage({
  course,
  navigate,
  addToCart,
  buyNow,
}: {
  course: CommerceCourse;
  navigate: Navigate;
  addToCart: (course: CommerceCourse) => void;
  buyNow: (course: CommerceCourse) => void;
}) {
  const [detailCourse, setDetailCourse] = useState<CommerceCourse | null>(null);
  const [detailError, setDetailError] = useState("");
  const [previewLesson, setPreviewLesson] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    title: string;
    description: string;
    content: string;
    resource_url: string;
  } | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const activeCourse = detailCourse?.slug === course.slug ? detailCourse : course;

  useEffect(() => {
    let active = true;
    setDetailError("");
    commerceApi.getCourse(course.slug).then(
      (result) => {
        if (active) setDetailCourse(result);
      },
      (reason: unknown) => {
        if (active) setDetailError(reason instanceof Error ? reason.message : "Course details could not be loaded.");
      },
    );
    return () => {
      active = false;
    };
  }, [course.slug]);

  const showPreview = async (lessonId: number) => {
    setPreviewLesson(lessonId);
    setPreview(null);
    setPreviewError("");
    setPreviewLoading(true);
    try {
      const response = await commerceApi.previewLesson(activeCourse.slug, lessonId);
      setPreview(response.lesson);
    } catch (reason) {
      setPreviewError(reason instanceof Error ? reason.message : "The preview could not be loaded.");
    } finally {
      setPreviewLoading(false);
    }
  };

  if (detailError) {
    return <main className="inner-page"><section className="section empty-state" role="alert"><h2>Course details are unavailable</h2><p>{detailError}</p><button className="button secondary" onClick={() => window.location.reload()}>Try again</button></section></main>;
  }

  return (
    <main className="inner-page">
      <section className="course-hero">
        <div className="course-hero-copy">
          <button className="breadcrumb" onClick={() => navigate("/courses")}>
            Courses <span>/</span> {activeCourse.category}
          </button>
          <span className="eyebrow">{activeCourse.qualification}</span>
          <h1>{activeCourse.title}</h1>
          <p>{activeCourse.description}</p>
          <div className="course-hero-meta">
            <span><Icon name="clock" />{activeCourse.duration || "Flexible schedule"}</span>
            <span><Icon name="level" />{activeCourse.difficulty || "All levels"}</span>
            <span><Icon name="globe" />Online learning</span>
          </div>
          <div className="hero-actions">
            <button className="button" disabled={!activeCourse.purchasable} onClick={() => buyNow(activeCourse)}>
              Buy now <Icon name="arrow" />
            </button>
            <button className="button secondary" disabled={!activeCourse.purchasable} onClick={() => addToCart(activeCourse)}>
              Add to cart
            </button>
          </div>
        </div>
        <div className="detail-image">
          <img src={activeCourse.image} alt="" />
          <span>{activeCourse.category}</span>
        </div>
      </section>

      <section className="section course-detail-grid">
        <div>
          <span className="eyebrow">Course overview</span>
          <h2>{activeCourse.overview || activeCourse.description}</h2>
          <p>{activeCourse.description}</p>
          <div className="outcome-grid">
            {(activeCourse.learning_outcomes || activeCourse.outcomes || []).map((outcome) => (
              <div key={outcome}>
                <span><Icon name="check" size={17} /></span>
                <p>{outcome}</p>
              </div>
            ))}
          </div>
          {!!activeCourse.skills?.length && (
            <div className="course-tag-list">
              <h3>Skills you’ll gain</h3>
              <div>{activeCourse.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </div>
          )}
        </div>
        <aside className="enrol-card">
          <small>PROGRAMME DETAILS</small>
          <CoursePrice course={activeCourse} />
          <dl>
            <div><dt>Qualification</dt><dd>{activeCourse.qualification}</dd></div>
            <div><dt>Category</dt><dd>{activeCourse.category}</dd></div>
            <div><dt>Duration</dt><dd>{activeCourse.duration || "Flexible"}</dd></div>
            <div><dt>Level</dt><dd>{activeCourse.difficulty || "All levels"}</dd></div>
          </dl>
          <button className="button" disabled={!activeCourse.purchasable} onClick={() => buyNow(activeCourse)}>
            Buy now <Icon name="arrow" />
          </button>
          <button className="button secondary" disabled={!activeCourse.purchasable} onClick={() => addToCart(activeCourse)}>Add to cart</button>
          {!activeCourse.purchasable && <p>Purchasing is unavailable until an administrator publishes a price and opens enrolment.</p>}
        </aside>
      </section>

      {activeCourse.prerequisites && (
        <section className="section course-information">
          <span className="eyebrow">Before you begin</span>
          <h2>Prerequisites</h2>
          <p>{activeCourse.prerequisites}</p>
        </section>
      )}

      {!!activeCourse.benefits?.length && (
        <section className="section course-information">
          <span className="eyebrow">Your learning experience</span>
          <h2>Course benefits</h2>
          <ul>{activeCourse.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul>
        </section>
      )}

      <section className="section curriculum-section" id="curriculum">
        <span className="eyebrow">Course curriculum</span>
        <h2>Explore the modules and lessons.</h2>
        {activeCourse.modules?.length ? (
          <div className="curriculum-list">
            {activeCourse.modules.map((module, index) => (
              <details key={module.id}>
                <summary>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><small>MODULE {index + 1}</small><h3>{module.title}</h3></div>
                  <span className="lesson-count">{module.lessons.length} lessons</span>
                </summary>
                {module.description && <p className="curriculum-description">{module.description}</p>}
                <div className="curriculum-lessons">
                  {module.lessons.map((lesson) => (
                    <article key={lesson.id}>
                      <div>
                        <strong>{lesson.title}</strong>
                        <span>{lesson.type} {lesson.duration && `· ${lesson.duration}`}</span>
                      </div>
                      {lesson.preview_available && (
                        <button className="text-link" onClick={() => void showPreview(lesson.id)}>
                          Preview lesson
                        </button>
                      )}
                    </article>
                  ))}
                  {!module.lessons.length && <p>Lessons are being prepared for this module.</p>}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="course-information-copy">The course team is preparing the curriculum.</p>
        )}
        {previewLesson !== null && (
          <div className="lesson-preview" role="region" aria-live="polite">
            <button className="lesson-preview-close" onClick={() => setPreviewLesson(null)} aria-label="Close preview">×</button>
            {previewLoading ? <p>Loading preview…</p> : previewError ? <p className="auth-feedback error">{previewError}</p> : preview && (
              <>
                <h3>{preview.title}</h3>
                {preview.description && <p>{preview.description}</p>}
                {preview.content && <div className="lesson-preview-content">{preview.content}</div>}
                {preview.resource_url && <video controls preload="metadata" src={preview.resource_url}>Your browser does not support video playback.</video>}
                {!preview.content && !preview.resource_url && <p>This preview has not been configured yet.</p>}
              </>
            )}
          </div>
        )}
      </section>

      <section className="section course-detail-grid">
        <div>
          <span className="eyebrow">Instructor</span>
          <h2>{activeCourse.instructor?.name || "LearnIsphere Faculty"}</h2>
          <p>{activeCourse.instructor?.bio || "Instructor information will be added by the course team."}</p>
        </div>
        <aside className="enrol-card">
          <span className="eyebrow">Certificate information</span>
          <p>{activeCourse.certificate_information || "Certificate eligibility and completion requirements will be provided for this course."}</p>
        </aside>
      </section>
    </main>
  );
}

export function CartPage({
  courses,
  cartSlugs,
  removeFromCart,
  navigate,
}: {
  courses: CommerceCourse[];
  cartSlugs: string[];
  removeFromCart: (slug: string) => void;
  navigate: Navigate;
}) {
  const items = cartSlugs.map((slug) => courses.find((course) => course.slug === slug));
  const hasUnavailableItem = items.some((course) => !course || !course.purchasable);
  return (
    <main className="inner-page">
      <section className="page-hero">
        <span className="eyebrow">Your selection</span>
        <h1>Your learning cart.</h1>
        <p>Course prices and availability are confirmed by LearnIsphere at checkout.</p>
      </section>
      <section className="section cart-layout">
        {cartSlugs.length === 0 ? (
          <div className="empty-state">
            <h2>Your cart is empty</h2>
            <p>Browse the catalogue to find a course for your next step.</p>
            <button className="button" onClick={() => navigate("/courses")}>Explore courses</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((course, index) => (
                <article className="cart-item" key={`${cartSlugs[index]}-${index}`}>
                  {course ? (
                    <>
                      <img src={course.image} alt="" />
                      <div className="cart-item-copy">
                        <span className="course-category">{course.category}</span>
                        <h2>{course.title}</h2>
                        <p>{course.qualification} · {course.duration}</p>
                      </div>
                      <CoursePrice course={course} />
                    </>
                  ) : (
                    <div className="cart-item-copy">
                      <h2>Course no longer available</h2>
                      <p>{cartSlugs[index]}</p>
                    </div>
                  )}
                  <button className="text-link" onClick={() => removeFromCart(cartSlugs[index])}>Remove</button>
                </article>
              ))}
            </div>
            <aside className="enrol-card cart-summary">
              <small>ORDER SUMMARY</small>
              <dl>
                <div><dt>Courses</dt><dd>{cartSlugs.length}</dd></div>
                <div><dt>Pricing</dt><dd>Confirmed at checkout</dd></div>
              </dl>
              {hasUnavailableItem && <p>Remove unavailable courses or select a published course before checkout.</p>}
              <button
                className="button"
                disabled={hasUnavailableItem}
                onClick={() => navigate("/checkout")}
              >
                Continue to checkout <Icon name="arrow" />
              </button>
              <button className="button secondary" onClick={() => navigate("/courses")}>Continue shopping</button>
            </aside>
          </>
        )}
      </section>
    </main>
  );
}

export function CheckoutPage({
  courses,
  cartSlugs,
  clearCart,
  navigate,
}: {
  courses: CommerceCourse[];
  cartSlugs: string[];
  clearCart: () => void;
  navigate: Navigate;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [couponError, setCouponError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paidOrder, setPaidOrder] = useState<{ id: string; total_amount: string; currency: string } | null>(null);
  const [orderNotice, setOrderNotice] = useState("");
  const selectedCourses = useMemo(
    () => cartSlugs.map((slug) => courses.find((course) => course.slug === slug)),
    [cartSlugs, courses],
  );
  const courseIds = selectedCourses.flatMap((course) => course ? [course.id] : []);
  const courseIdKey = courseIds.join(",");

  useEffect(() => {
    authApi.me().then(
      (profile) => {
        if (profile.role === "student") setUser(profile);
        else setError("Only a student account can complete course checkout.");
      },
      (reason: unknown) => {
        if (!(reason instanceof AuthApiError) || reason.status !== 401) {
          setError(reason instanceof Error ? reason.message : "Your account could not be checked.");
        }
      },
    ).finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!user || !courseIdKey) return;
    commerceApi.quote(courseIds, appliedCoupon).then(
      (result) => {
        setQuote(result);
        setCouponError("");
      },
      (reason: unknown) => {
        setQuote(null);
        setCouponError(reason instanceof Error ? reason.message : "Your order total could not be calculated.");
      },
    );
  }, [user, courseIdKey, appliedCoupon]);

  const signIn = (page: "login" | "register") => {
    window.localStorage.setItem("learnisphere:return-to", "/checkout");
    navigate(`/${page}?next=%2Fcheckout`);
  };

  const pay = async () => {
    setError("");
    setOrderNotice("");
    if (!acceptedTerms) {
      setError("Accept the purchase terms before continuing.");
      return;
    }
    if (courseIds.length !== selectedCourses.length || courseIds.length === 0) {
      setError("Remove unavailable courses from your cart before checkout.");
      return;
    }
    setBusy(true);
    try {
      await loadRazorpay();
      const response = await commerceApi.checkout(courseIds, appliedCoupon, crypto.randomUUID());
      if (!window.Razorpay) throw new Error("Secure payment checkout is unavailable.");
      const gateway = response.gateway;
      const checkout = new window.Razorpay({
        key: gateway.key_id,
        order_id: gateway.order_id,
        amount: gateway.amount,
        currency: gateway.currency,
        name: "LearnIsphere",
        description: response.order.id,
        prefill: user ? { name: user.full_name, email: user.email } : undefined,
        handler: (result) => {
          if (result.razorpay_order_id !== gateway.order_id) {
            setError("The payment response did not match this order.");
            setBusy(false);
            return;
          }
          commerceApi.verifyPayment(
            response.order.id,
            result.razorpay_payment_id,
            result.razorpay_signature,
          ).then(
            (verified) => {
              setPaidOrder(verified.order);
              setOrderNotice(verified.detail);
              setQuote(null);
              clearCart();
              setBusy(false);
            },
            (reason: unknown) => {
              setError(reason instanceof Error ? reason.message : "Payment verification failed.");
              setBusy(false);
            },
          );
        },
        modal: {
          ondismiss: () => {
            commerceApi.cancelOrder(response.order.id).then(
              () => setOrderNotice("Checkout was cancelled. Your cart is still available."),
              (reason: unknown) => setError(reason instanceof Error ? reason.message : "The checkout status could not be updated."),
            ).finally(() => setBusy(false));
          },
        },
      });
      checkout.on("payment.failed", (result) => {
        setError(result.error?.description || "Payment failed. Your course access has not been granted.");
        setBusy(false);
      });
      checkout.open();
    } catch (reason) {
      setError(
        reason instanceof CommerceApiError
          ? reason.message
          : reason instanceof Error
            ? reason.message
            : "Checkout could not be started.",
      );
      setBusy(false);
    }
  };

  if (paidOrder) {
    return (
      <main className="inner-page">
        <section className="section payment-success">
          <span className="eyebrow">Payment verified</span>
          <h1>Your learning journey starts here.</h1>
          <p>{orderNotice || "Payment verified. Your courses are now available in the Student Dashboard."}</p>
          <p>Order {paidOrder.id} · {formatCoursePrice(paidOrder.total_amount, paidOrder.currency)}</p>
          <button className="button" onClick={() => { window.location.assign("/dashboard/student"); }}>
            Go to My Courses <Icon name="arrow" />
          </button>
        </section>
      </main>
    );
  }

  if (!authChecked) {
    return <main className="inner-page"><section className="section checkout-message"><p>Checking your account…</p></section></main>;
  }

  if (!user) {
    return (
      <main className="inner-page">
        <section className="page-hero">
          <span className="eyebrow">Secure checkout</span>
          <h1>{error ? "Student account required." : "Sign in to continue."}</h1>
          <p>{error || "Your cart is saved on this device while you sign in or create a student account."}</p>
        </section>
        <section className="section checkout-message">
          {!error && <><button className="button" onClick={() => signIn("login")}>Sign in</button>
          <button className="button secondary" onClick={() => signIn("register")}>Create a student account</button></>}
        </section>
      </main>
    );
  }

  if (!cartSlugs.length) {
    return (
      <main className="inner-page">
        <section className="section empty-state">
          <h1>Your cart is empty</h1>
          <p>Add a course before starting checkout.</p>
          <button className="button" onClick={() => navigate("/courses")}>Explore courses</button>
        </section>
      </main>
    );
  }

  return (
    <main className="inner-page">
      <section className="page-hero">
        <span className="eyebrow">Secure checkout</span>
        <h1>Complete your enrolment.</h1>
        <p>Prices, discounts and taxes are revalidated by LearnIsphere before payment.</p>
      </section>
      <section className="section checkout-layout">
        <div className="checkout-form">
          <div className="checkout-account">
            <span className="eyebrow">Student account</span>
            <strong>{user.full_name}</strong>
            <span>{user.email}</span>
          </div>
          <label className="checkout-coupon">
            Coupon code
            <span>
              <input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} maxLength={40} placeholder="Enter a coupon code" />
              <button className="button secondary" type="button" onClick={() => setAppliedCoupon(couponCode.trim())}>Apply</button>
            </span>
          </label>
          {couponError && <p className="auth-feedback error" role="alert">{couponError}</p>}
          <label className="checkout-terms">
            <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
            <span>I agree to the purchase Terms and Conditions.</span>
          </label>
          {error && <p className="auth-feedback error" role="alert">{error}</p>}
          {orderNotice && <p className="auth-feedback success" role="status">{orderNotice}</p>}
          <button className="button checkout-pay" disabled={busy || !quote || !acceptedTerms} onClick={() => void pay()}>
            {busy ? "Starting secure payment…" : "Pay securely"}
          </button>
          <p className="checkout-security">Payments are handled by Razorpay. LearnIsphere does not store card numbers or CVVs.</p>
        </div>
        <aside className="enrol-card checkout-summary">
          <small>ORDER SUMMARY</small>
          {selectedCourses.map((course, index) => (
            <div className="checkout-item" key={`${cartSlugs[index]}-${index}`}>
              {course ? <><span>{course.title}</span><strong>{formatCoursePrice(course.price, course.currency)}</strong></> : <span>Unavailable course · remove it from your cart.</span>}
            </div>
          ))}
          {quote ? (
            <dl>
              <div><dt>Subtotal</dt><dd>{formatCoursePrice(quote.subtotal, quote.currency)}</dd></div>
              <div><dt>Discount</dt><dd>−{formatCoursePrice(quote.discount_amount, quote.currency)}</dd></div>
              <div><dt>Tax ({quote.tax_rate}%)</dt><dd>{formatCoursePrice(quote.tax_amount, quote.currency)}</dd></div>
              <div className="checkout-total"><dt>Total</dt><dd>{formatCoursePrice(quote.total_amount, quote.currency)}</dd></div>
            </dl>
          ) : <p>{couponError || "Calculating your verified total…"}</p>}
        </aside>
      </section>
    </main>
  );
}
