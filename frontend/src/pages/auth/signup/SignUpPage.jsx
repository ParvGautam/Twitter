import { Link } from "react-router-dom";
import { useState } from "react";

import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const passwordRequirements = [
	"At least 8 characters",
	"At least 1 lowercase letter",
	"At least 1 uppercase letter",
	"At least 1 number",
	"At least 1 symbol (!@#$%^&*)",
];

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		fullName: "",
		password: "",
	});

	const queryClient = useQueryClient();

	const { mutate, isError, isPending, error } = useMutation({
		mutationFn: async ({ email, username, fullName, password }) => {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, username, fullName, password }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to create account");
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className="max-w-screen-xl mx-auto flex h-screen px-10">
			<div className="flex-1 hidden lg:flex items-center justify-center">
				<XSvg className="lg:w-2/3 fill-white" />
			</div>
			<div className="flex-1 flex flex-col justify-center items-center">
				<form className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col" onSubmit={handleSubmit}>
					<XSvg className="w-24 lg:hidden fill-white" />
					<h1 className="text-4xl font-extrabold text-white">Join today.</h1>
					<label className="input input-bordered rounded flex items-center gap-2">
						<MdOutlineMail />
						<input
							type="email"
							className="grow"
							placeholder="Email"
							name="email"
							onChange={handleInputChange}
							value={formData.email}
						/>
					</label>
					<div className="flex gap-4 flex-wrap">
						<label className="input input-bordered rounded flex items-center gap-2 flex-1">
							<FaUser />
							<input
								type="text"
								className="grow"
								placeholder="Username"
								name="username"
								onChange={handleInputChange}
								value={formData.username}
							/>
						</label>
						<label className="input input-bordered rounded flex items-center gap-2 flex-1">
							<MdDriveFileRenameOutline />
							<input
								type="text"
								className="grow"
								placeholder="Full Name"
								name="fullName"
								onChange={handleInputChange}
								value={formData.fullName}
							/>
						</label>
					</div>
					<div className="relative flex items-center gap-2">
						<label className="input input-bordered rounded flex items-center gap-2 grow">
							<MdPassword />
							<input
								type="password"
								className="grow"
								placeholder="Password"
								name="password"
								onChange={handleInputChange}
								value={formData.password}
							/>
						</label>
						<div className="relative group">
							<span className="flex items-center justify-center w-6 h-6 text-xs font-bold bg-gray-300 text-black rounded-full cursor-pointer">
								i
							</span>
							<div className="absolute hidden group-hover:flex flex-col w-72 bg-gray-700 text-white text-xs rounded-lg p-4 shadow-lg -right-2 top-8">
								<h3 className="font-bold mb-2">Password Requirements:</h3>
								<ul className="space-y-1">
									{passwordRequirements.map((req, idx) => (
										<li key={idx}>- {req}</li>
									))}
								</ul>
							</div>
						</div>
					</div>
					<button className="btn rounded-full btn-primary text-white">
						{isPending ? "Loading..." : "Sign up"}
					</button>
					{isError && <p className="text-red-500">{error.message}</p>}
				</form>
				<div className="flex flex-col lg:w-2/3 gap-2 mt-4">
					<p className="text-white text-lg">Already have an account?</p>
					<Link to="/login">
						<button className="btn rounded-full btn-primary text-white btn-outline w-full">
							Sign in
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SignUpPage;
