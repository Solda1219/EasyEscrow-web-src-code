import { Bars } from "react-loader-spinner";

const PageLoader = () => {
	return (
        <main>
            <div className="container banner-inner min-height">
                <div className="page-loader">
                    <Bars
                        height="100"
                        width="100"
                        color="#F2AE00"
                        ariaLabel="loading-indicator"
                    />
                </div>
            </div>
        </main>
    );
}

export default PageLoader;
