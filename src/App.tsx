import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Clock, Loader2, Phone, AlertTriangle, Wifi, WifiOff, XCircle, Search } from "lucide-react";
import { Input } from "./components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Button } from "./components/ui/button";

type ErrorType = "network" | "notfound" | "server" | "invalid" | "";

interface ApiResult {
  status?: string;
  [key: string]: unknown;
}

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [errorType, setErrorType] = useState<ErrorType>("");

  const fetchMinutes = async (phone: string): Promise<void> => {
    setLoading(true);
    setError("");
    setErrorType("");
    setResult(null);

    try {
      const response = await fetch(`https://backend.kiraniapp.com/api/utils/minutes/${phone}`);

      if (!response.ok) {
        if (response.status === 404) {
          setErrorType("notfound");
          setError("Phone number not found in our system");
        } else if (response.status >= 500) {
          setErrorType("server");
          setError("Server is experiencing issues. Please try again later.");
        } else if (response.status === 400) {
          setErrorType("invalid");
          setError("Invalid phone number format");
        } else {
          setErrorType("server");
          setError(`Service unavailable (Error ${response.status})`);
        }
        return;
      }

      const data: ApiResult = await response.json();
      setResult(data);
    } catch (err) {
      const error = err as Error;
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setErrorType("network");
        setError("Network connection failed. Please check your internet connection.");
      } else {
        setErrorType("server");
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case "network":
        return <WifiOff className="w-12 h-12 text-red-500" />;
      case "notfound":
        return <Search className="w-12 h-12 text-yellow-500" />;
      case "server":
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
      case "invalid":
        return <XCircle className="w-12 h-12 text-orange-500" />;
      default:
        return <AlertTriangle className="w-12 h-12 text-red-500" />;
    }
  };

  const getErrorColor = (): string => {
    switch (errorType) {
      case "network":
        return "border-red-200 bg-red-50";
      case "notfound":
        return "border-yellow-200 bg-yellow-50";
      case "server":
        return "border-red-200 bg-red-50";
      case "invalid":
        return "border-orange-200 bg-orange-50";
      default:
        return "border-red-200 bg-red-50";
    }
  };

  const getErrorTitle = (): string => {
    switch (errorType) {
      case "network":
        return "Connection Error";
      case "notfound":
        return "Number Not Found";
      case "server":
        return "Server Error";
      case "invalid":
        return "Invalid Number";
      default:
        return "Error";
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorType("invalid");
      setError("Please enter a phone number");
      return;
    }
    fetchMinutes(phoneNumber.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    // Remove any non-digit characters
    const cleanValue = value.replace(/\D/g, "");
    setPhoneNumber(cleanValue);
    // Clear error when user starts typing
    if (error) {
      setError("");
      setErrorType("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Logo */}
        <div className="text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src="/android-chrome-512x512.png"
                alt="Logo"
                className="h-20 w-auto object-contain drop-shadow-lg"
                onError={(e) => {
                  // Fallback if logo.png doesn't exist, try other common extensions
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes("logo.png")) {
                    target.src = "/logo.svg";
                  } else if (target.src.includes("logo.svg")) {
                    target.src = "/logo.jpg";
                  } else if (target.src.includes("logo.jpg")) {
                    target.src = "/logo.jpeg";
                  } else {
                    // Hide image if no logo found
                    target.style.display = "none";
                  }
                }}
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Minutes Checker</h1>
              <p className="text-gray-600">Check your phone minutes balance</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Enter Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="02093606060"
                  value={phoneNumber}
                  onChange={handleInputChange}
                  className="text-lg"
                  disabled={loading}
                  onKeyPress={handleKeyPress}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={loading || !phoneNumber.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Check Minutes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cool Error Display */}
        {error && (
          <Card
            className={`shadow-lg border-2 ${getErrorColor()} transform transition-all duration-300 hover:scale-105`}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="animate-bounce">{getErrorIcon()}</div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-800">{getErrorTitle()}</h3>
                  <p className="text-gray-600 max-w-md">{error}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setError("");
                      setErrorType("");
                    }}
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Dismiss
                  </Button>
                  {errorType === "network" && (
                    <Button
                      onClick={() => phoneNumber && fetchMinutes(phoneNumber)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Results Display */}
        {result && (
          <Card className="shadow-lg border-2 border-green-200 bg-green-50 transform transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <div className="animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
                Results Found!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-green-700">{phoneNumber}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="text-lg font-semibold text-green-600">{result.status || "Success"}</p>
                  </div>
                </div>

                {/* Display all returned data */}
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Minutes Details:</p>
                  <pre className="text-sm bg-gray-50 p-3 rounded border overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enter a phone number (digits only)</li>
              <li>• Click "Check Minutes" to fetch data from the API</li>
              <li>• The results will display the Minutes</li>
              <li>• Example: 02093606060</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default App;
