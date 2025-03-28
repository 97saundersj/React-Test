using Microsoft.EntityFrameworkCore;
using TeaRoundPickerWebAPI.Data;
using TeaRoundPickerWebAPI.DTOs;
using TeaRoundPickerWebAPI.Models;

namespace TeaRoundPickerWebAPI.Services
{
    public class TeamService(TeaRoundPickerContext context) : ITeamService
    {
        private readonly TeaRoundPickerContext _context = context;

        public async Task<IEnumerable<Team>> GetTeams()
        {
            return await _context.Teams
                .Include(t => t.Participants)
                .ToListAsync();
        }

        public async Task<Team> GetTeam(int id)
        {
            return await _context.Teams
                .Include(t => t.Participants)
                .FirstAsync(t => t.Id == id);
        }

        public async Task UpdateTeam(int id, Team team)
        {
            if (id != team.Id)
            {
                throw new ArgumentException("Team ID mismatch.");
            }

            _context.Entry(team).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TeamExists(id))
                {
                    throw new KeyNotFoundException("Team not found.");
                }
                else
                {
                    throw;
                }
            }
        }

        public async Task<Team> CreateTeam(CreateTeamDto createTeamDto)
        {
            if (createTeamDto == null || string.IsNullOrWhiteSpace(createTeamDto.Label))
            {
                throw new ArgumentException("Team name is required.");
            }

            var team = new Team(0, createTeamDto.Label, []);

            _context.Teams.Add(team);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TeamExists(team.Id))
                {
                    throw new InvalidOperationException("Team already exists.");
                }
                else
                {
                    throw;
                }
            }

            return team;
        }

        public async Task DeleteTeam(int id)
        {
            var team = await _context.Teams.FindAsync(id);
            if (team == null)
            {
                throw new KeyNotFoundException("Team not found.");
            }

            _context.Teams.Remove(team);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<TeaRound>> GetPreviousParticipantSelectionsForTeam(int teamId)
        {
            return await _context.TeaRounds
                .Where(entry => entry.TeamId == teamId)
                .Include(t => t.TeaOrders)
                .ToListAsync();
        }

        private bool TeamExists(int id)
        {
            return _context.Teams.Any(e => e.Id == id);
        }
    }
} 