"use client";

import React, { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/feedback-modal";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showFeedbackModal: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showFeedbackModal: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showFeedbackModal: false,
    });
  };

  handleReportError = () => {
    this.setState({ showFeedbackModal: true });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
          <div className="max-w-lg w-full">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
              {/* Error Icon */}
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 text-center mb-3">
                Une erreur est survenue
              </h1>

              {/* Description */}
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                Nous sommes désolés, quelque chose s'est mal passé. Cette application est en version BETA et
                nous travaillons constamment à l'améliorer.
              </p>

              {/* Error Details */}
              {this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                    Détails de l'erreur :
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleReportError}
                  className="w-full bg-[#5B949A] hover:bg-[#4A7B80] text-white"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Signaler cette erreur
                </Button>

                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full border-slate-300 dark:border-slate-700"
                >
                  Réessayer
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  variant="ghost"
                  className="w-full text-slate-600 dark:text-slate-400"
                >
                  Recharger la page
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6">
                Si le problème persiste, veuillez nous signaler cette erreur pour que nous puissions la corriger.
              </p>
            </div>
          </div>

          {/* Feedback Modal */}
          <FeedbackModal
            isOpen={this.state.showFeedbackModal}
            onClose={() => this.setState({ showFeedbackModal: false })}
            errorInfo={{
              message: this.state.error?.message || "Erreur inconnue",
              stack: this.state.error?.stack,
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
