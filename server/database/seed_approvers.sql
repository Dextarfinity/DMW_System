-- Seed approver and related accounts (PPMP → PO approval flows)
-- Run this after existing user seeds (seed_users.sql)

BEGIN;

-- Note: uses ON CONFLICT DO NOTHING so running multiple times is safe.
INSERT INTO users (username, password_hash, full_name, email, role, dept_id, is_active, secondary_role)
VALUES
  ('giovanni.paredes', '$2b$10$pWWCv2WHJr95WgPUabbVL.f6ti.5qPncwvN.NlrBkXw791Hjg4KfS', 'Giovanni S. Paredes', 'giovanni.paredes@dmw.gov.ph', 'bac_secretariat', 1, true, NULL),
  ('candyjoy.maglupay',  '$2b$10$6YnbiTgX.4iEd2eYZjqQfe2RG1o/2f5LfVvYZMn.NF.oL0YU7Wx16', 'Candy Joy B. Maglupay', NULL, 'requester', 3, true, NULL),
  ('annejane',           '$2b$10$IBKx2pmh7dZN3xLuV6/zX.zfLs9rppjMpV69N2JQh/fY2qtRk9OCe', 'ANNE JANE M. HALLASGO', 'anne.hallasgo@dmw.gov.ph', 'ppmp_encoder', 4, true, 'twg_head'),
  ('regienald.espaldon', 'chief123', 'Regienald S. Espaldon', 'regienald.espaldon@dmw.gov.ph', 'chief_fad', 1, true, 'bac_chair'),
  ('marissa.garay',      'chief123', 'Marissa A. Garay', 'magaray826@gmail.com', 'chief_mwpsd', 3, true, NULL),
  ('cherryl.oculam',     'chief123', 'Cherryl C. Oculam', 'cheryl.oculam@dmw.gov.ph', 'chief_mwptd', 2, true, NULL),
  ('mark.marasigan',     '$2b$10$7PtGFP.IlvCq.k5MjIdt9.DEiDozWfPNzb4p/yc0KByWaA5vjFt.6', 'Mark E. Marasigan', 'markem03@gmail.com', 'supply_officer', 1, true, NULL),
  ('aurorajean.torralba','$2b$10$C.PCGSbqz7UPGUS.Koqaj.KGa3kmWwdz/FAjW7r1bN4BJ7lpTqF9.', 'Aurora Jean A. Torralba', 'ajeanabad@gmail.com', 'ppmp_encoder', 3, true, NULL),
  ('ritchel.butao',      '$2b$10$L5vMe7Q15HvYvkBFbdKm/uYPCI.GxIDbyHcYCuW4vHGe8vcGA2eUy', 'Ritchel M. Butao', 'ritchel.butao@dmw.gov.ph', 'hope', 5, true, NULL),
  ('kurt.reserva',       '$2b$10$uPAh.ITtkSnqOqOK3IWqo.VYLeSscbCk0nlcDsOHBf3NbhQ4qxXkG', 'Kurt P. Reserva', 'blue09908@gmail.com', 'admin', NULL, true, NULL),
  ('glomerbayotko',      '$2b$10$ulZI9Wumwt/PVH9NHJ9H5..ikwPUdbtPpzfCN2.eRIhI71yBU2OX2', 'Glomer P. Celestino', 'xdfeverharsh@gmail.com', 'admin', NULL, true, NULL),
  ('eval.makinano',      'chief123', 'Eval B. Makinano', 'makinanoeval.mcdrm9@gmail.com', 'chief_wrsd', 4, true, 'bac_chair'),
  ('johnlouie.medillo',  '$2b$10$cQ4vpp4HZEuCWbTebwhHCukrBMDXaj360sskBNRtOWXmHaMPxq8Ny', 'John Louie A. Medillo', 'john.medillo@dmw.gov.ph', 'budget_consultant', 1, true, NULL)
ON CONFLICT (username) DO NOTHING;

COMMIT;

-- Verify with:
-- SELECT id, username, full_name, role, dept_id, secondary_role FROM users WHERE username IN (
--  'giovanni.paredes','candyjoy.maglupay','annejane','regienald.espaldon','marissa.garay',
--  'cherryl.oculam','mark.marasigan','aurorajean.torralba','ritchel.butao','kurt.reserva',
--  'glomerbayotko','eval.makinano','johnlouie.medillo'
-- );
