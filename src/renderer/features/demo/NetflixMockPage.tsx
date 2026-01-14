import React, { useState } from 'react';
import './NetflixMock.css';

export function NetflixMockPage() {
    const [formState, setFormState] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        firstName: '',
        lastName: ''
    });
    const [isAutofilled, setIsAutofilled] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleAutofill = () => {
        // Simulate SubGuard "filling" only the sensitive fields
        setFormState(prev => ({
            ...prev,
            cardNumber: '5501 2293 8492 1039',
            expiry: '09/28',
            cvv: '942',
            firstName: 'Nicholas',
            lastName: 'Rocha'
        }));
        setIsAutofilled(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(true);

        // Determine status based on if we used SubGuard
        const status = isAutofilled ? 'protected' : 'unprotected';

        // Trigger event for the main dashboard to pick up
        // We use localStorage to communicate across tabs
        const eventData = {
            id: Date.now(),
            service: 'Netflix',
            amount: '$19.99/mo',
            status: status,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('subguard_new_subscription', JSON.stringify(eventData));
    };

    if (success) {
        return (
            <div className="netflix-mock success-view">
                <div className="netflix-logo">NETFLIX</div>
                <div className="success-content">
                    <h1>Welcome to Netflix!</h1>
                    <p>Your membership has started.</p>
                    <p className="sub-text">We've sent a receipt to your email.</p>
                    <div className="check-mark">✓</div>
                </div>
            </div>
        );
    }

    return (
        <div className="netflix-mock">
            <header>
                <div className="netflix-logo">NETFLIX</div>
                <a href="#" className="signin-link">Sign In</a>
            </header>

            <div className="checkout-container">
                <div className="checkout-content">
                    <span className="step-indicator">STEP 3 OF 3</span>
                    <h1>Set up your credit or debit card</h1>
                    <div className="payment-icons">
                        <span className="icon">VISA</span>
                        <span className="icon">MC</span>
                        <span className="icon">AMEX</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={formState.firstName}
                                onChange={e => setFormState({ ...formState, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={formState.lastName}
                                onChange={e => setFormState({ ...formState, lastName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Card Number"
                                value={formState.cardNumber}
                                onChange={e => setFormState({ ...formState, cardNumber: e.target.value })}
                                className={isAutofilled ? 'autofilled' : ''}
                                required
                            />
                            <span className="card-icon">💳</span>
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                placeholder="Expiration Date (MM/YY)"
                                value={formState.expiry}
                                onChange={e => setFormState({ ...formState, expiry: e.target.value })}
                                className={isAutofilled ? 'autofilled' : ''}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Security Code (CVV)"
                                value={formState.cvv}
                                onChange={e => setFormState({ ...formState, cvv: e.target.value })}
                                className={isAutofilled ? 'autofilled' : ''}
                                required
                            />
                        </div>

                        <div className="plan-info">
                            <div className="plan-row">
                                <span>Premium Plan</span>
                                <a href="#">Change</a>
                            </div>
                            <div className="plan-price">$19.99/month</div>
                        </div>

                        <p className="terms">
                            By clicking the "Start Membership" button below, you agree to our Terms of Use, Privacy Statement, and that you are over 18.
                        </p>

                        <button type="submit" className="btn-netflix-primary">
                            Start Membership
                        </button>
                    </form>
                </div>
            </div>

            {/* SubGuard Autofill Overlay */}
            {!isAutofilled && (
                <div className="subguard-autofill-prompt" onClick={handleAutofill}>
                    <div className="sg-logo-small">🛡️</div>
                    <div className="sg-text">
                        <strong>Use SubGuard Virtual Card?</strong>
                        <span>Hide your real info & protect this recurring payment.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
