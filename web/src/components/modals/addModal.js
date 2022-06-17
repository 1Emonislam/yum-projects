import { Box, Button, Modal } from '@material-ui/core';
import Cancel from '@material-ui/icons/Cancel';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
    // getClientRole,
    // timeFormat,
    // timezone,
    useAuth,
    useSecureBranches,
    // useSecureClients,
    // useSecureClientGroupsByBranchId,
} from 'shared'
import './addModal.css';
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: 'none',
    outline: 0,
    boxShadow: 0,
    borderRadius: '8px',
    p: 4,
};
export default function AddModel({ addOpen, content, setAddOpen, addHandleOpen, addHandleClose }) {

    const {
        _id: userId,
        branchId: userRelatedBranchId,
        role,
        isAdmin,
        // isLoanOfficer,
        isAreaOrRegionalManager,
    } = useAuth()

    const {
        status,
        branchId = (isAdmin || isAreaOrRegionalManager) ? '' : userRelatedBranchId,
        // clientGroupId,
    } = useParams()

    const { data: rawBranches = [],
        // isFetching: isFetchingBranches
    } =
        useSecureBranches({
            status,
            role,
            userId,
            branchId,
        })

    const { register, reset, handleSubmit } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const handleShow = () => setShowPassword(!showPassword);
    const [showPassword2, setShowPassword2] = useState(false);
    const handleShow2 = () => setShowPassword2(!showPassword2);
    const onSubmit = data => {
        console.log(data)
    };

    return (
        <div>
            <Modal
                open={addOpen}
                // onClose={addHandleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: '0', padding: '0' }}>{content?.title}</h3>
                        <Cancel style={{ cursor: 'pointer' }} onClick={() => addHandleClose()} />
                    </div>
                    <br />
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <input style={{
                            width: '90%', outline: 'none', border: '1px solid #ddd', marginBottom: "15px", borderRadius: '3px', padding: '10px', '&:focus': {
                                borderColor: 'green',
                                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                            },
                        }} autoComplete="off" ref={register} name="firstName" type="text" placeholder={"First Name"} required />
                        <select ref={register} name="role" style={{
                            width: '90%', outline: 'none', marginBottom: "15px", border: '1px solid #ddd', borderRadius: '3px', padding: '10px', '&:focus': {
                                borderColor: 'green',
                                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                            },
                        }}>
                            <option value="admin">Admin</option>
                            <option value="branchManager">Branch Manager</option>
                            <option value="loanofficer">Loan Officer</option>
                            <option value="regionalManager">Regional Manager</option>
                            <option value="areaManager">Area Manager</option>
                        </select>

                        <input style={{
                            width: '90%', outline: 'none', marginBottom: "15px", border: '1px solid #ddd', borderRadius: '3px', padding: '10px', '&:focus': {
                                borderColor: 'green',
                                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                            },
                        }} autoComplete="off" ref={register} name="fullPhoneNumber" min="0" type="text" defaultValue={'+' + 256} required />
                        <input style={{
                            width: '90%', outline: 'none', marginBottom: "15px", border: '1px solid #ddd', borderRadius: '3px', padding: '10px', '&:focus': {
                                borderColor: 'green',
                                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                            },
                        }} autoComplete="off" ref={register} name="lastName" type="text" placeholder={"Last Name"} required />
                        <select ref={register} name="branchId" style={{
                            width: '90%', outline: 'none', marginBottom: "15px", border: '1px solid #ddd', borderRadius: '3px', padding: '10px', '&:focus': {
                                borderColor: 'green',
                                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                            },
                        }}>

                            {rawBranches?.map((branch, i) => <option key={i} value={branch?._id}>
                                {
                                (branch?.name)
                                }
                            </option>)}
                        </select>
                        <input style={{
                            width: '90%', outline: 'none', border: '1px solid #ddd', marginBottom: "15px", borderRadius: '3px', padding: '10px', '&:focus': {
                                borderColor: 'green',
                                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                            },
                        }} autoComplete="off" ref={register} name="password" type={showPassword ? "text" : "password"} placeholder={"Password"} required />
                        <div className='icon-svg-path' style={{ position: 'relative' }}>
                            {showPassword ?
                                <span onClick={handleShow}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                </span> :
                                <span onClick={handleShow}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg></span>
                            }
                        </div>
                        <input style={{
                            width: '90%', outline: 'none', border: '1px solid #ddd', marginBottom: "15px", borderRadius: '3px', padding: '10px', '&:focus': {
                                borderColor: 'green',
                                boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
                            },
                        }} autoComplete="off" ref={register} name="re-password" type={showPassword2 ? "text" : "password"} placeholder={"Re Password"} required />
                        <div className='icon-svg-path' style={{ position: 'relative' }}>
                            {showPassword2 ?
                                <span onClick={handleShow2}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                </span> :
                                <span onClick={handleShow2}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg></span>
                            }
                        </div>
                        <br />
                        <div>
                            <Button onClick={() => addHandleClose()} variant="contained" style={{ background: 'red', padding: '5px 20px', cursor: 'pointer', borderRadius: '5px', color: 'white', marginRight: '20px' }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" style={{ background: 'green', padding: '5px 20px', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>
                                Submit
                            </Button>
                        </div>
                    </form>
                </Box>
            </Modal>
        </div >
    );
}
